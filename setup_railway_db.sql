-- RAILWAY POSTGRESQL SETUP
-- Execute este script no Railway PostgreSQL Database

-- Tabela de médicos
CREATE TABLE IF NOT EXISTS medicos (
    id SERIAL PRIMARY KEY,
    crm VARCHAR(20) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP,
    terms_version VARCHAR(50),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(crm, uf)
);

-- Tabela de demonstrativos
CREATE TABLE IF NOT EXISTS demonstrativos (
    id SERIAL PRIMARY KEY,
    user_crm VARCHAR(20) NOT NULL,
    user_uf VARCHAR(2) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    periodo VARCHAR(100),
    lote VARCHAR(255),
    total_procedures INTEGER DEFAULT 0,
    total_presented DECIMAL(15,2) DEFAULT 0,
    total_approved DECIMAL(15,2) DEFAULT 0,
    total_glosa DECIMAL(15,2) DEFAULT 0,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'uploaded',
    FOREIGN KEY (user_crm, user_uf) REFERENCES medicos(crm, uf)
);

-- Tabela de procedimentos do demonstrativo
CREATE TABLE IF NOT EXISTS demonstrativo_procedures (
    id SERIAL PRIMARY KEY,
    demonstrativo_id INTEGER NOT NULL,
    codigo VARCHAR(20),
    descricao TEXT,
    quantidade INTEGER DEFAULT 1,
    valor_apresentado DECIMAL(15,2),
    valor_aprovado DECIMAL(15,2),
    valor_glosa DECIMAL(15,2),
    data_atendimento DATE,
    numero_guia VARCHAR(50),
    beneficiario VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (demonstrativo_id) REFERENCES demonstrativos(id) ON DELETE CASCADE
);

-- Tabela de guias médicas  
CREATE TABLE IF NOT EXISTS guias (
    id SERIAL PRIMARY KEY,
    user_crm VARCHAR(20) NOT NULL,
    user_uf VARCHAR(2) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    total_procedures INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'uploaded',
    FOREIGN KEY (user_crm, user_uf) REFERENCES medicos(crm, uf)
);

-- Tabela de procedimentos das guias
CREATE TABLE IF NOT EXISTS guia_procedures (
    id SERIAL PRIMARY KEY,
    guia_id INTEGER NOT NULL,
    codigo VARCHAR(20),
    descricao TEXT,
    quantidade INTEGER DEFAULT 1,
    valor DECIMAL(15,2),
    data_atendimento DATE,
    numero_guia VARCHAR(50),
    beneficiario VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guia_id) REFERENCES guias(id) ON DELETE CASCADE
);

-- Criar usuário de teste para Railway
INSERT INTO medicos (crm, uf, nome, email, senha_hash, terms_accepted) 
VALUES ('12345', 'SP', 'Dr. Railway', 'teste@railway.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true)
ON CONFLICT (email) DO NOTHING;

-- Criar demonstrativo de teste
INSERT INTO demonstrativos (user_crm, user_uf, filename, periodo, total_procedures, total_presented, total_approved, total_glosa)
VALUES ('12345', 'SP', 'demo_railway.pdf', 'Railway Test 2024', 2, 1500.00, 1200.00, 300.00)
ON CONFLICT DO NOTHING;

-- Criar procedimentos de teste
INSERT INTO demonstrativo_procedures (demonstrativo_id, codigo, descricao, quantidade, valor_apresentado, valor_aprovado, valor_glosa, numero_guia, beneficiario)
VALUES 
(1, '30101012', 'Consulta médica Railway', 1, 750.00, 600.00, 150.00, 'RW123456', 'João Railway'),
(1, '30102019', 'Exame laboratorial Railway', 1, 750.00, 600.00, 150.00, 'RW123456', 'João Railway')
ON CONFLICT DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_demonstrativos_user ON demonstrativos(user_crm, user_uf);
CREATE INDEX IF NOT EXISTS idx_demonstrativo_procedures_demo_id ON demonstrativo_procedures(demonstrativo_id);
CREATE INDEX IF NOT EXISTS idx_guias_user ON guias(user_crm, user_uf);
CREATE INDEX IF NOT EXISTS idx_guia_procedures_guia_id ON guia_procedures(guia_id);
CREATE INDEX IF NOT EXISTS idx_medicos_email ON medicos(email);

-- Verificar criação das tabelas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;