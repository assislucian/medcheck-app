# MedCheck - Sistema Médico Profissional

Sistema completo para análise de demonstrativos médicos, gestão de procedimentos não pagos e controle de glosas.

## 🚀 **STATUS DO PROJETO**

✅ **Repositório Limpo e Funcional**  
✅ **Código Testado e Validado**  
✅ **Deploy Ready para Render**  

---

## 🏗️ **ARQUITETURA**

### **Backend**
- **FastAPI** - API moderna e performática
- **SQLite** - Banco de dados local
- **JWT** - Autenticação segura  
- **CORS** - Configurado para produção

### **Frontend** 
- **React** - Interface moderna e responsiva
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Design system consistente
- **Vite** - Build tool otimizado

---

## 📊 **FUNCIONALIDADES**

- 🏥 **Dashboard Analítico** - Visão completa dos dados médicos
- 📋 **Análise de Procedimentos** - Crosscheck com tabela CBHPM
- ⚖️ **Gestão de Glosas** - Controle e contestação de glosas
- 💰 **Procedimentos Não Pagos** - Identificação e análise
- 🔐 **Autenticação Segura** - Sistema de login com JWT
- 📱 **Interface Responsiva** - Funciona em desktop e mobile

---

## 🚀 **DEPLOY**

### **Render.com (Produção)**
- **Backend**: `backend/app.py` (versão otimizada)
- **Frontend**: `frontend/` (build otimizado)
- **Deploy**: Automático via GitHub

### **Local (Desenvolvimento)**
```bash
# Backend Local
cd src && python -m uvicorn api:app --reload

# Frontend  
cd frontend && npm run dev
```

---

## ⚙️ **CONFIGURAÇÃO RÁPIDA**

### **1. Backend**
```bash
pip install -r requirements.txt
python -m uvicorn backend.app:app --reload
```

### **2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 **ESTRUTURA**

```
medcheck-sistema-medico/
├── backend/          # API para produção (Render)
├── src/              # API para desenvolvimento local
├── frontend/         # Interface React + TypeScript
├── data/             # Dados CBHPM e testes
├── render.yaml       # Configuração Render
└── requirements.txt  # Dependências Python
```

---

## 🔧 **RENDER DEPLOYMENT**

O projeto está configurado para deploy automático no Render:

- **Arquivo**: `render.yaml`
- **Comando**: `python -m uvicorn backend.app:app --host 0.0.0.0 --port $PORT`
- **Dependências**: Listadas em `requirements.txt`

---

## 📝 **PRÓXIMOS PASSOS**

Para usar este repositório no Render:

1. **Conectar repositório** no dashboard do Render
2. **Configurar variáveis** de ambiente
3. **Deploy automático** será iniciado
4. **Testar endpoints** após deploy

---

**Repositório limpo e otimizado para produção! 🎉**