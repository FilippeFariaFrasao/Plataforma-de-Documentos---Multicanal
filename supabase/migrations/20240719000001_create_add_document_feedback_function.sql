-- Criar uma função para adicionar feedbacks evitando o problema de restrição de chave única
-- Esta função insere um novo feedback com um novo UUID gerado pelo servidor

CREATE OR REPLACE FUNCTION add_document_feedback(
  p_document_id UUID,
  p_user_id UUID,
  p_rating INTEGER,
  p_comment TEXT
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Gerar um novo UUID para o feedback
  new_id := uuid_generate_v4();
  
  -- Inserir o feedback com o novo ID
  INSERT INTO document_feedback (
    id,
    document_id,
    user_id,
    rating,
    comment,
    created_at
  ) VALUES (
    new_id,
    p_document_id,
    p_user_id,
    p_rating,
    p_comment,
    NOW()
  );
  
  -- Retornar o ID do novo feedback
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 