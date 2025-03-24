-- Adiciona a referência que estava faltando à tabela document_feedback

-- Adicionar restrição de chave estrangeira para document_feedback.user_id referenciando auth.users(id)
ALTER TABLE document_feedback 
  DROP CONSTRAINT IF EXISTS document_feedback_user_id_fkey,
  ADD CONSTRAINT document_feedback_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

-- Atualizar também a tipagem na geração de tipos do Supabase
COMMENT ON COLUMN document_feedback.user_id IS 'Reference to auth.users.id';

-- Verificar se as permissões de RLS estão configuradas corretamente
ALTER TABLE document_feedback ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para feedback
DROP POLICY IF EXISTS "Permitir usuários inserirem feedback" ON document_feedback;
CREATE POLICY "Permitir usuários inserirem feedback"
  ON document_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Permitir usuários visualizarem próprio feedback" ON document_feedback;
CREATE POLICY "Permitir usuários visualizarem próprio feedback"
  ON document_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Permitir administradores visualizarem todos os feedbacks" ON document_feedback;
CREATE POLICY "Permitir administradores visualizarem todos os feedbacks"
  ON document_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Permitir usuários atualizarem próprio feedback" ON document_feedback;
CREATE POLICY "Permitir usuários atualizarem próprio feedback"
  ON document_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Permitir usuários excluírem próprio feedback" ON document_feedback;
CREATE POLICY "Permitir usuários excluírem próprio feedback"
  ON document_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 