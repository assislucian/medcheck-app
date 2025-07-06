-- Corrige tipos e garante colunas obrigatórias na tabela demonstrativos
-- 1. Corrigir tipos das colunas para VARCHAR
ALTER TABLE demonstrativos ALTER COLUMN apresentado TYPE VARCHAR USING apresentado::varchar;
ALTER TABLE demonstrativos ALTER COLUMN liberado TYPE VARCHAR USING liberado::varchar;
ALTER TABLE demonstrativos ALTER COLUMN glosa TYPE VARCHAR USING glosa::varchar;

-- 2. Garantir defaults
ALTER TABLE demonstrativos ALTER COLUMN apresentado SET DEFAULT 'R$ 0,00';
ALTER TABLE demonstrativos ALTER COLUMN liberado SET DEFAULT 'R$ 0,00';
ALTER TABLE demonstrativos ALTER COLUMN glosa SET DEFAULT 'R$ 0,00';

-- 3. Garantir colunas obrigatórias (adiciona se não existir)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demonstrativos' AND column_name='crm') THEN
        ALTER TABLE demonstrativos ADD COLUMN crm VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demonstrativos' AND column_name='uf') THEN
        ALTER TABLE demonstrativos ADD COLUMN uf VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demonstrativos' AND column_name='periodo') THEN
        ALTER TABLE demonstrativos ADD COLUMN periodo VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demonstrativos' AND column_name='lote') THEN
        ALTER TABLE demonstrativos ADD COLUMN lote VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demonstrativos' AND column_name='filename') THEN
        ALTER TABLE demonstrativos ADD COLUMN filename VARCHAR;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demonstrativos' AND column_name='file_hash') THEN
        ALTER TABLE demonstrativos ADD COLUMN file_hash VARCHAR(64);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demonstrativos' AND column_name='total_procedimentos') THEN
        ALTER TABLE demonstrativos ADD COLUMN total_procedimentos INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demonstrativos' AND column_name='upload_time') THEN
        ALTER TABLE demonstrativos ADD COLUMN upload_time TIMESTAMP;
    END IF;
END$$;

-- Adiciona coluna nome_arquivo se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='demonstrativos' AND column_name='nome_arquivo') THEN
        ALTER TABLE demonstrativos ADD COLUMN nome_arquivo VARCHAR;
        -- Preenche nome_arquivo com o valor de filename para registros existentes
        UPDATE demonstrativos SET nome_arquivo = filename WHERE nome_arquivo IS NULL;
        -- Adiciona constraint NOT NULL
        ALTER TABLE demonstrativos ALTER COLUMN nome_arquivo SET NOT NULL;
    END IF;
END$$; 