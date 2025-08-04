import os
import uvicorn
from src.api import app

if __name__ == "__main__":
    # Garante que a porta seja lida do ambiente, com fallback para 8080
    port = int(os.environ.get("PORT", "8080"))
    
    # Inicia o servidor Uvicorn
    # A lógica de inicialização da aplicação (ex: banco de dados)
    # está agora dentro de src/api.py nos eventos de startup.
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
