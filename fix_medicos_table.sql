-- Script para corrigir a estrutura da tabela medicos
-- Adiciona coluna id como PRIMARY KEY
ALTER TABLE medicos ADD COLUMN id SERIAL PRIMARY KEY;

-- Remove a constraint de PRIMARY KEY do crm
ALTER TABLE medicos DROP CONSTRAINT medicos_pkey;

-- Adiciona constraint UNIQUE para crm e uf
ALTER TABLE medicos ADD CONSTRAINT medicos_crm_uf_unique UNIQUE (crm, uf);

-- Verifica a estrutura final
\d medicos; 