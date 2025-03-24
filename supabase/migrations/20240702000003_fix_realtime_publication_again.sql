-- Check if tables exist in the publication before adding them

DO $$
BEGIN
  -- Check and add document_access if not already in publication
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'document_access') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE document_access;
  END IF;
  
  -- Check and add document_feedback if not already in publication
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'document_feedback') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE document_feedback;
  END IF;
  
  -- Check and add user_document_views if not already in publication
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'user_document_views') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_document_views;
  END IF;
END
$$;