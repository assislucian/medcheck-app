# 🚀 MedCheck - Vercel Deployment Guide

## 📋 Overview

Este projeto está configurado com as **melhores práticas** para deployment no Vercel usando Vite + React + TypeScript.

## 🏗️ Configuração Otimizada

### Build Settings

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci --prefer-offline --no-audit",
  "devCommand": "npm run dev -- --port $PORT"
}
```

### Environment Variables

```bash
VITE_API_URL=https://medcheck-app-medcheck.up.railway.app
VITE_APP_ENV=production
NODE_ENV=production
```

## 🎯 Features Implementadas

### Performance

- ✅ **Manual Chunking**: Vendor, UI, Router, Forms separados
- ✅ **Asset Optimization**: Cache headers otimizados
- ✅ **Build Size**: Sourcemaps desabilitados em produção
- ✅ **Memory Management**: Node options otimizadas

### Security

- ✅ **Headers de Segurança**: HTTPS, XSS, CSRF protection
- ✅ **Content Security**: X-Frame-Options, X-Content-Type
- ✅ **HSTS**: Strict Transport Security habilitado

### SEO & UX

- ✅ **Clean URLs**: URLs limpos sem extensão
- ✅ **SPA Routing**: Fallback para index.html
- ✅ **API Proxy**: Redirecionamento para Railway backend

## 📁 Estrutura de Deploy

```
frontend/
├── dist/                    # Build output (gerado)
├── src/                     # Source code
├── public/                  # Assets estáticos
├── vercel.json             # Configuração Vercel
├── .vercelignore           # Arquivos ignorados
├── vite.config.ts          # Configuração Vite
└── package.json            # Dependencies & scripts
```

## 🔧 Commands

```bash
# Setup inicial do Vercel
./scripts/setup_vercel_fresh.sh

# Build local
npm run build

# Preview local
npm run preview

# Deploy manual
vercel --prod

# Verificar deployments
vercel ls

# Ver logs
vercel logs

# Inspecionar deployment
vercel inspect [URL]
```

## 🌐 URLs

- **Produção**: https://medcheck-app.vercel.app
- **Dashboard**: https://vercel.com/dashboard
- **API Backend**: https://medcheck-app-medcheck.up.railway.app

## 🚀 Deploy Process

1. **Commit & Push** para `main` branch
2. **Auto-deploy** detecta mudanças
3. **Build** executa `npm run build`
4. **Deploy** para produção automaticamente
5. **Cache** invalidado automaticamente

## 📊 Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.0s

## 🔍 Troubleshooting

### Build Fails

```bash
# Check build locally
cd frontend
npm ci
npm run build
```

### Environment Issues

```bash
# Verify env vars
vercel env ls
vercel env add VITE_API_URL production
```

### Cache Issues

```bash
# Force new deployment
vercel --force
```

## 📈 Best Practices Implemented

### Code Splitting

- Vendor libraries separados
- UI components em chunk próprio
- Route-based splitting

### Asset Optimization

- Hashes em nomes de arquivos
- Cache headers otimizados
- Gzip/Brotli compression

### Security Headers

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- Content Security Policy

### Performance

- Tree shaking habilitado
- Bundle analysis
- Lazy loading de rotas
- Image optimization

## 🎉 Success Indicators

✅ **Auto-deploy funcionando**  
✅ **Build time < 2 minutos**  
✅ **Zero-downtime deployments**  
✅ **HTTPS certificado válido**  
✅ **Performance score > 90**

---

**🔧 Última atualização**: Janeiro 2025  
**📱 Compatibilidade**: Modern browsers (ES2020+)  
**🌍 CDN**: Global (Frankfurt primary)
