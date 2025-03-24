export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category_id: string | null;
  file_path: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
  is_restricted: boolean;
  category?: Category;
}

export interface DocumentAccess {
  id: string;
  document_id: string;
  user_id: string;
  can_view: boolean;
  can_edit: boolean;
  created_at: string;
}

export interface DocumentFeedback {
  id: string;
  document_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface UserDocumentView {
  id: string;
  document_id: string;
  user_id: string;
  viewed_at: string;
  document?: Document;
}
