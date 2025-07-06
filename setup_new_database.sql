-- Script para configurar o schema correto no novo banco de dados
-- Execute este script no novo banco PostgreSQL do Render

-- 1. Criar a tabela medicos com a estrutura correta
CREATE TABLE IF NOT EXISTS medicos (
    id SERIAL PRIMARY KEY,
    crm VARCHAR NOT NULL,
    uf VARCHAR NOT NULL,
    nome VARCHAR NOT NULL,
    senha_hash VARCHAR NOT NULL,
    terms_accepted INTEGER NOT NULL DEFAULT 0,
    terms_accepted_at TIMESTAMP,
    terms_version VARCHAR,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Adicionar constraint UNIQUE para crm e uf
ALTER TABLE medicos ADD CONSTRAINT medicos_crm_uf_unique UNIQUE (crm, uf);

-- 3. Criar tabela de logs de atividade
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    medico_id INTEGER REFERENCES medicos(id),
    action VARCHAR NOT NULL,
    details JSONB,
    ip_address VARCHAR,
    user_agent VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar tabela de demonstrativos
CREATE TABLE IF NOT EXISTS demonstrativos (
    id SERIAL PRIMARY KEY,
    medico_id INTEGER REFERENCES medicos(id),
    nome_arquivo VARCHAR NOT NULL,
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR DEFAULT 'pending',
    resultado JSONB
);

-- 5. Criar tabela de consentimentos (se necessário)
CREATE TABLE IF NOT EXISTS consentimentos (
    id SERIAL PRIMARY KEY,
    medico_id INTEGER REFERENCES medicos(id),
    tipo VARCHAR NOT NULL,
    aceito BOOLEAN DEFAULT FALSE,
    data_aceite TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Criar tabela de perfis_medico (se necessário)
CREATE TABLE IF NOT EXISTS perfis_medico (
    id SERIAL PRIMARY KEY,
    medico_id INTEGER REFERENCES medicos(id),
    especialidade VARCHAR,
    experiencia INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Verificar a estrutura criada
\d medicos; 