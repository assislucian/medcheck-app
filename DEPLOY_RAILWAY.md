# Deploy no Railway

## Configuração de Variáveis de Ambiente

Para fazer o deploy no Railway, configure as seguintes variáveis de ambiente no painel do Railway:

### Obrigatórias

- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT (usar secrets.token_urlsafe(32))

### Recomendadas

- `ADMIN_SECRET`: Chave secreta para funcionalidades administrativas
- `ENV`: "production" (Railway detecta automaticamente)
- `FRONTEND_ORIGINS`: Lista de origens permitidas separadas por vírgula
  ```
  https://medcheck-app.vercel.app,https://www.medcheck-app.vercel.app,https://medcheck.app
  ```
- `FRONTEND_ORIGIN_REGEX`: Regex para permitir deployments de preview do Vercel
  ```
  https://medcheck-app-[a-z0-9-]+\.vercel\.app
  ```

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
   railway variables set FRONTEND_ORIGINS="https://medcheck-app.vercel.app,https://www.medcheck-app.vercel.app"
   railway variables set FRONTEND_ORIGIN_REGEX="https://medcheck-app-[a-z0-9-]+\.vercel\.app"
   railway variables set ENV="production"
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

- Configure `FRONTEND_ORIGINS` com os domínios permitidos do Vercel
- Configure `FRONTEND_ORIGIN_REGEX` para permitir deployments de preview
- Verifique se o frontend está fazendo requisições para a URL correta do Railway

### Erro 502 no Railway

- Verifique se a aplicação está rodando na porta `$PORT` (Railway define automaticamente)
- Confirme que o comando de start está correto no `Procfile` ou script de start

### Token expirado

- Implemente refresh token no frontend
- Configure tempo de expiração adequado no JWT_SECRET
