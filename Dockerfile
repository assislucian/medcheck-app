# Dockerfile para FastAPI Backend (Railway)
FROM python:3.11-slim

WORKDIR /app

# Instala dependências
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código-fonte
COPY ./src ./src
COPY ./backend ./backend
COPY ./logs ./logs
COPY ./uploads ./uploads

# Expõe a porta padrão do Railway (será definida pela variável $PORT)
EXPOSE $PORT

# Comando de start usando a variável PORT do Railway
CMD uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000} 