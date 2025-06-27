# Deploy no Railway

## Configuração de Variáveis de Ambiente

Para fazer o deploy no Railway, configure as seguintes variáveis de ambiente no painel do Railway:

### Obrigatórias

- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (usar secrets.token_urlsafe(32))

### Recomendadas

- `ADMIN_SECRET`: Chave secreta para funcionalidades administrativas
- `ENV`: "production" (Railway detecta automaticamente)
- `CORS_ORIGINS`: Lista de origens permitidas (ex: "https://meuapp.com,https://app.railway.app")

### Opcionais

- `SKIP_AUTH`: "false" (default em produção)
- `CRM_LOGADO`: Apenas para desenvolvimento/teste
- `UPLOAD_DIR`: "./uploads" (default)
- `RESULTS_DIR`: "./results" (default)

## Comandos para Deploy

1. **Instalar Railway CLI:**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login no Railway:**

   ```bash
   railway login
   ```

3. **Inicializar projeto:**

   ```bash
   railway init
   ```

4. **Configurar variáveis de ambiente:**

   ```bash
   railway variables set DATABASE_URL="postgresql://user:pass@host:port/db"
   railway variables set JWT_SECRET="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
   railway variables set ADMIN_SECRET="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

## Procfile

O Railway detecta automaticamente Python e FastAPI, mas você pode criar um `Procfile` se necessário:

```
web: uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

## Verificação de Saúde

Após o deploy, teste o endpoint de saúde:

```
GET https://[seu-app].railway.app/healthz
```

## Troubleshooting

### Erro: "ADMIN_SECRET deve ser configurado em produção!"

- Solução: Configure a variável `ADMIN_SECRET` no Railway

### Erro de conexão com banco

- Verifique se `DATABASE_URL` está configurada corretamente
- Confirme que o banco PostgreSQL está ativo

### Erro de CORS

- Configure `CORS_ORIGINS` com os domínios permitidos
- Verifique se o frontend está fazendo requisições para a URL correta
