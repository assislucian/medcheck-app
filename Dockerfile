# Dockerfile para FastAPI Backend (Railway)
FROM python:3.11-slim

# Install system dependencies needed for some Python packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt ./

# Install Python dependencies with optimizations for Railway
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Create necessary directories
RUN mkdir -p ./logs ./uploads ./results

# Copy source code
COPY ./src ./src

# Copy backend directory if it exists
COPY ./backend ./backend

# Copy other files and directories
COPY ./logs ./logs
COPY ./uploads ./uploads

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Expose port (Railway will set $PORT)
EXPOSE $PORT

# Use bash to properly handle environment variable substitution
CMD ["bash", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"] 