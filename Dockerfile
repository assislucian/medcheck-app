# ===========================================
# MEDCHECK BACKEND - DOCKERFILE PRODUCTION
# ===========================================
# Multi-stage build para otimização e segurança

# Stage 1: Build dependencies
FROM python:3.11-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /build

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production runtime
FROM python:3.11-slim as production

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r medcheck && useradd -r -g medcheck medcheck

# Set working directory
WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /root/.local /root/.local

# Create necessary directories with correct permissions
RUN mkdir -p logs uploads results && \
    chown -R medcheck:medcheck /app

# Copy source code
COPY --chown=medcheck:medcheck . .

# Make sure scripts are executable
RUN chmod +x /app/src/main.py

# Set environment variables for production
ENV PYTHONPATH="/app/src:/app"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PATH="/root/.local/bin:$PATH"

# Security: Run as non-root user
USER medcheck

# Expose port (configured by Render automatically)
EXPOSE $PORT

# Health check for monitoring
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Start application with production-optimized settings
CMD ["sh", "-c", "uvicorn src.api:app --host 0.0.0.0 --port ${PORT:-8080} --workers 2 --access-log --log-level info"] 