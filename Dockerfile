# Dockerfile (produção Railway)
FROM python:3.11-slim

# Evita .pyc e garante logs imediatos
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Dependências de sistema p/ pacotes Python comuns (psycopg2 etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements da raiz
COPY requirements.txt .

# Instalar dependências (sem --user)
RUN pip install --no-cache-dir -r requirements.txt

# Copiar app
COPY . .

# Comando de start (Railway injects PORT automatically)
# Usar main.py que já tem toda a inicialização necessária
CMD python src/main.py