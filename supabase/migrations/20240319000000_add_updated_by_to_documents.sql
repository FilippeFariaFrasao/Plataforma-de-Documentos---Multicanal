-- Adicionar coluna updated_by à tabela documents
ALTER TABLE documents
ADD COLUMN updated_by UUID REFERENCES auth.users(id);

-- Criar trigger para atualizar updated_by automaticamente
CREATE OR REPLACE FUNCTION update_documents_updated_by()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER documents_updated_by_trigger
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_documents_updated_by();

-- Atualizar os registros existentes para definir updated_by igual a created_by
UPDATE documents
SET updated_by = created_by
WHERE updated_by IS NULL; 