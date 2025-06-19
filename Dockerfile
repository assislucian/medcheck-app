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

# Expõe a porta padrão do Railway
EXPOSE 8000

# Comando de start
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"] 