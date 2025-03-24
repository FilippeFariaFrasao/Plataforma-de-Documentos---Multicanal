-- Disable RLS on users table to allow inserts
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Enable realtime for users table
alter publication supabase_realtime add table users;