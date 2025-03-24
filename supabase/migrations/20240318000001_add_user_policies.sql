-- Permitir que usuários autenticados leiam dados de outros usuários
CREATE POLICY "Permitir leitura de dados básicos dos usuários"
ON auth.users FOR SELECT TO authenticated
USING (true);

-- Criar uma view pública para dados básicos dos usuários
CREATE OR REPLACE VIEW public.users AS
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users; 