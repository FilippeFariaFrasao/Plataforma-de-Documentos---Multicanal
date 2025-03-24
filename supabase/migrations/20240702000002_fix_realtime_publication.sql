-- Skip adding categories table to realtime publication since it's already a member
-- Only add the other tables that aren't already members

alter publication supabase_realtime add table documents;
alter publication supabase_realtime add table document_access;
alter publication supabase_realtime add table document_feedback;
alter publication supabase_realtime add table user_document_views;
