-- Criar o bucket para armazenamento de documentos
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict do nothing;

-- Remover políticas existentes se houver
drop policy if exists "Usuários autenticados podem fazer upload de arquivos 1s1ug2k" on storage.objects;
drop policy if exists "Dar acesso público para visualizar arquivos 1s1ug2k" on storage.objects;

-- Permitir que usuários autenticados façam upload de arquivos
create policy "Permitir upload de arquivos para usuários autenticados"
on storage.objects for insert to authenticated
with check (bucket_id = 'documents');

-- Permitir que usuários autenticados atualizem seus próprios arquivos
create policy "Permitir atualização de arquivos para usuários autenticados"
on storage.objects for update to authenticated
using (bucket_id = 'documents');

-- Permitir que qualquer pessoa visualize os arquivos
create policy "Permitir acesso público para leitura"
on storage.objects for select to public
using (bucket_id = 'documents'); 