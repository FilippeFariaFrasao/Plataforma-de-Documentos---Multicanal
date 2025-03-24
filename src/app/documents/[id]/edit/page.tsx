import { redirect } from "next/navigation";
import { createClient } from "../../../../../supabase/server";
import { DocumentForm } from "@/components/document-form";

export default async function EditDocumentPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const supabase = await createClient();

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Erro de autenticação:", authError);
      redirect("/sign-in");
    }

    // Buscar documento
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", params.id)
      .single();

    if (docError || !document) {
      console.error("Erro ao buscar documento:", docError);
      redirect("/documents");
    }

    // Buscar categorias
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (catError) {
      console.error("Erro ao buscar categorias:", catError);
    }

    return (
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-2xl font-bold">Editar Documento</h1>
        <DocumentForm 
          document={document} 
          categories={categories || []} 
        />
      </div>
    );
  } catch (error) {
    console.error("Erro na página de edição:", error);
    redirect("/documents");
  }
} 