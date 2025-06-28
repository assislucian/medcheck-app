FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create directories
RUN mkdir -p logs uploads results

# Health check – Railway always maps container port 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose default port used by Railway
EXPOSE 8080

# Start application; fallback to 8080 if $PORT não definido (execução local)
CMD sh -c "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8080}" 