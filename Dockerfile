# Usa a imagem oficial do Python como base
FROM python:3.11-slim

# Define variáveis de ambiente para otimizar a execução em contêiner
# PYTHONDONTWRITEBYTECODE: Impede o Python de gerar arquivos .pyc
# PYTHONUNBUFFERED: Garante que logs sejam enviados diretamente, sem buffer
# PYTHONPATH: Adiciona o diretório /app ao path, essencial para resolver imports
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Instala dependências do sistema necessárias para compilar algumas libs Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia o arquivo de dependências para o contêiner
COPY requirements.txt .

# Instala as dependências do Python, sem cache para manter a imagem leve
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código da aplicação para o diretório de trabalho
COPY . .

# Comando de start final e robusto, recomendado para Railway
# Executa o shell para interpretar a variável de ambiente PORT.
# O entrypoint é src.main, que por sua vez inicia o uvicorn com o app de src.api.
CMD ["python", "-m", "src.main"]
