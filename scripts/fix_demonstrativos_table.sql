-- Adiciona colunas necessárias na tabela demonstrativos
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS crm VARCHAR;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS uf VARCHAR;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS periodo VARCHAR;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS lote VARCHAR;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS filename VARCHAR;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS file_hash VARCHAR;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS total_procedimentos INTEGER;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS apresentado BOOLEAN;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS liberado BOOLEAN;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS glosa BOOLEAN;
ALTER TABLE demonstrativos ADD COLUMN IF NOT EXISTS upload_time TIMESTAMP; 