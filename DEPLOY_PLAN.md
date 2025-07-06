# Plano de Deploy Completo — MedCheck

## 1. Objetivo

Deploy seguro, escalável e em conformidade com LGPD/GDPR para SaaS Healthtech, com administração remota (solo founder na Alemanha) e operação principal no Brasil.

---

## 2. Infraestrutura e Suboperadores

- **Backend (API Python/FastAPI):**
  - Hospedagem: AWS (preferencialmente região São Paulo, fallback Europa)
  - Banco de dados: Supabase (Postgres, preferir instância Europa/GDPR ou AWS RDS São Paulo)
  - Armazenamento de arquivos: AWS S3 (região São Paulo)
- **Frontend (React/Vercel):**
  - Deploy: Vercel (fácil integração, domínio próprio)
- **E-mails transacionais:**
  - SendGrid (EUA, fácil integração, plano gratuito para baixo volume)
- **Analytics:**
  - Google Analytics (EUA) ou Plausible/Matomo (Europa, privacy-first)

---

## 3. Passos de Deploy

### 3.1. Backend

1. Configurar repositório GitHub privado.
2. Provisionar instância AWS EC2 (ou ECS/Fargate) na região desejada.
3. Configurar variáveis de ambiente (segredos, chaves, URLs de banco, SMTP, etc).
4. Provisionar banco de dados (Supabase ou AWS RDS).
5. Provisionar bucket S3 para uploads.
6. Configurar HTTPS (certbot/ACM).
7. Deploy do código via CI/CD (GitHub Actions, Vercel, ou manual SSH).
8. Configurar backups automáticos do banco e arquivos.
9. Monitoramento: CloudWatch, Sentry, ou similar.

### 3.2. Frontend

1. Deploy via Vercel (conectar repositório GitHub, configurar domínio).
2. Configurar variáveis de ambiente (API URL, chaves públicas, etc).
3. Testar build e integração com backend.

### 3.3. E-mails

1. Criar conta SendGrid, configurar domínio e autenticação SPF/DKIM.
2. Integrar chave SendGrid no backend.
3. Testar envio de e-mails (cadastro, recuperação de senha, notificações LGPD).

### 3.4. Analytics

1. Configurar Google Analytics (ou Plausible/Matomo).
2. Adicionar consentimento de cookies no frontend.
3. Testar coleta de dados e dashboards.

---

## 4. Segurança e Compliance

- **Criptografia em trânsito:** HTTPS obrigatório em todas as camadas.
- **Criptografia em repouso:** Ativar no banco e S3.
- **Política de senha forte e 2FA (quando possível).**
- **Backups automáticos e testes de restauração.**
- **Logs de acesso e incidentes.**
- **Contratos de DPA com todos os suboperadores.**
- **Política de Privacidade e Termos de Uso atualizados e publicados.**
- **Endpoints LGPD implementados (exportação, exclusão, consentimento, canal de atendimento).**

---

## 5. Operação e Gestão

- **Administração 100% remota via painéis web (AWS, Supabase, Vercel, SendGrid, etc).**
- **Monitoramento de custos e alertas de uso.**
- **Automação de notificações e incidentes críticos.**
- **Documentação de processos e credenciais seguras.**

---

## 6. Checklist Final para Go-Live

- [ ] Testes de ponta a ponta (cadastro, login, upload, exportação, exclusão, logs, LGPD)
- [ ] Testes de performance e latência do Brasil
- [ ] Testes de backup/restauração
- [ ] Revisão de segurança (senhas, tokens, CORS, headers)
- [ ] Revisão de compliance (LGPD, DPA, política de privacidade)
- [ ] Plano de contingência/documentação de suporte

---

## 7. Observações

- Este plano pode ser adaptado conforme crescimento do negócio (multi-região, multi-cloud, equipe, etc).
- Revisar periodicamente suboperadores e contratos.
- Manter logs e auditoria de todas as operações críticas.

---

**Este arquivo serve como referência viva para deploy e operação do MedCheck.**
