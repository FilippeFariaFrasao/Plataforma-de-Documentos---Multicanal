-- Remove a restrição de chave única da tabela document_feedback para permitir múltiplos feedbacks do mesmo usuário para o mesmo documento

-- Remover a restrição de chave única que impede múltiplos feedbacks
ALTER TABLE document_feedback 
  DROP CONSTRAINT IF EXISTS document_feedback_document_id_user_id_key;

-- Comentário explicando a alteração
COMMENT ON TABLE document_feedback IS 'Armazena feedbacks de usuários sobre documentos. Permite múltiplos feedbacks do mesmo usuário para o mesmo documento.'; 