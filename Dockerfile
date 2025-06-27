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

# Set default port for Railway
ENV PORT=8000

# Health check using the app's health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Expose the port
EXPOSE ${PORT}

# Start the application with proper port handling
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT} --workers 1 