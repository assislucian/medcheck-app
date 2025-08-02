# -*- coding: utf-8 -*-
"""
FastAPI middleware components
"""
import time
import logging
from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.middleware.base import RequestResponseEndpoint
from typing import Callable

logger = logging.getLogger(__name__)

class TimingMiddleware(BaseHTTPMiddleware):
    """Middleware to log request timing"""
    
    async def dispatch(
        self, 
        request: Request, 
        call_next: RequestResponseEndpoint
    ) -> Response:
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        logger.info(
            f"{request.method} {request.url.path} - "
            f"{response.status_code} - {process_time:.4f}s"
        )
        
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to responses"""
    
    async def dispatch(
        self, 
        request: Request, 
        call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

class CORSHeadersMiddleware(BaseHTTPMiddleware):
    """Handle CORS headers for API access"""
    
    def __init__(self, app, allowed_origins: list = None):
        super().__init__(app)
        self.allowed_origins = allowed_origins or ["*"]
    
    async def dispatch(
        self, 
        request: Request, 
        call_next: RequestResponseEndpoint
    ) -> Response:
        response = await call_next(request)
        
        origin = request.headers.get("origin")
        
        if origin in self.allowed_origins or "*" in self.allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin or "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        return response

def setup_middleware(app):
    """Setup all middleware for the application"""
    
    # Add timing middleware
    app.add_middleware(TimingMiddleware)
    
    # Add security headers
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Add CORS headers
    app.add_middleware(CORSHeadersMiddleware)
    
    logger.info("Middleware setup completed")