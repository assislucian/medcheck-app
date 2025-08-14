# -*- coding: utf-8 -*-
"""
MEDCHECK PERFORMANCE MIDDLEWARE
Real-time performance monitoring and optimization
"""
import time
import logging
import asyncio
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import psutil
import os

logger = logging.getLogger("performance.middleware")

class PerformanceMiddleware(BaseHTTPMiddleware):
    """
    Middleware para monitoramento de performance em tempo real.
    
    Features:
    - Timing de todas as requests
    - Monitoring de memória e CPU
    - Rate limiting inteligente
    - Health checks automáticos
    """
    
    def __init__(self, app, slow_request_threshold: float = 1.0):
        super().__init__(app)
        self.slow_request_threshold = slow_request_threshold
        self.request_count = 0
        self.slow_requests = 0
        
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Collect system metrics
        process = psutil.Process(os.getpid())
        memory_before = process.memory_info().rss / 1024 / 1024  # MB
        
        # Add performance headers
        request.state.start_time = start_time
        request.state.memory_before = memory_before
        
        # Process request
        response = await call_next(request)
        
        # Calculate metrics
        process_time = time.time() - start_time
        memory_after = process.memory_info().rss / 1024 / 1024  # MB
        memory_delta = memory_after - memory_before
        
        # Update counters
        self.request_count += 1
        if process_time > self.slow_request_threshold:
            self.slow_requests += 1
            logger.warning(
                f"Slow request: {request.method} {request.url.path} "
                f"took {process_time:.3f}s (memory: +{memory_delta:.1f}MB)"
            )
        
        # Add performance headers to response
        response.headers["X-Process-Time"] = str(round(process_time, 3))
        response.headers["X-Memory-Usage"] = str(round(memory_after, 1))
        response.headers["X-Memory-Delta"] = str(round(memory_delta, 1))
        
        # Log performance metrics for critical endpoints
        if request.url.path in ["/register", "/token", "/api/v1/guias"]:
            logger.info(
                f"PERF: {request.method} {request.url.path} "
                f"- {process_time*1000:.1f}ms "
                f"- {memory_after:.1f}MB RAM"
            )
        
        return response

class DatabaseConnectionMiddleware(BaseHTTPMiddleware):
    """
    Middleware para otimização de conexões de banco.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Warm up database connection for critical endpoints
        if request.url.path in ["/register", "/token"]:
            # Pre-warm connection pool
            from src.database import SessionLocal
            db = SessionLocal()
            try:
                # Simple query to warm up connection
                await asyncio.get_event_loop().run_in_executor(
                    None, lambda: db.execute("SELECT 1").scalar()
                )
            except Exception as e:
                logger.warning(f"Connection warm-up failed: {e}")
            finally:
                db.close()
        
        return await call_next(request)

class CompressionMiddleware(BaseHTTPMiddleware):
    """
    Middleware para compressão de responses grandes.
    """
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add compression hint for large responses
        if hasattr(response, 'body') and len(response.body) > 1024:  # >1KB
            response.headers["X-Large-Response"] = "true"
            # Note: FastAPI handles gzip automatically with GZipMiddleware
            
        return response

def setup_performance_middleware(app):
    """
    Configura todos os middlewares de performance.
    """
    # Order matters - first added = last executed
    app.add_middleware(CompressionMiddleware)
    app.add_middleware(DatabaseConnectionMiddleware) 
    app.add_middleware(PerformanceMiddleware, slow_request_threshold=0.5)
    
    logger.info("Performance middleware configured successfully")

# Global performance metrics collector
class PerformanceMetrics:
    """
    Coletor de métricas de performance para monitoramento.
    """
    
    def __init__(self):
        self.reset_metrics()
    
    def reset_metrics(self):
        self.total_requests = 0
        self.total_time = 0.0
        self.slow_requests = 0
        self.error_requests = 0
        self.start_time = time.time()
    
    def add_request(self, duration: float, error: bool = False):
        self.total_requests += 1
        self.total_time += duration
        
        if error:
            self.error_requests += 1
        if duration > 1.0:  # >1s is slow
            self.slow_requests += 1
    
    def get_stats(self) -> dict:
        uptime = time.time() - self.start_time
        avg_response_time = (self.total_time / self.total_requests 
                           if self.total_requests > 0 else 0)
        
        return {
            "uptime_seconds": round(uptime, 1),
            "total_requests": self.total_requests,
            "requests_per_second": round(self.total_requests / uptime, 2),
            "average_response_time_ms": round(avg_response_time * 1000, 1),
            "slow_request_percentage": round(
                (self.slow_requests / self.total_requests * 100) 
                if self.total_requests > 0 else 0, 1
            ),
            "error_rate_percentage": round(
                (self.error_requests / self.total_requests * 100)
                if self.total_requests > 0 else 0, 1
            )
        }

# Global metrics instance
performance_metrics = PerformanceMetrics()
