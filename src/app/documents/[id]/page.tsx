import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import DocumentFeedbackForm from "@/components/document-feedback-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, User } from "lucide-react";
import Link from "next/link";
import DocumentFeedback from "@/components/document-feedback";
import DocumentContent from "@/components/document-content";

export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  if (!params.id) {
    return notFound();
  }

  try {
    const supabase = await createClient();

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/sign-in");
    }

    // Buscar o documento com a categoria
    const { data: document, error } = await supabase
      .from("documents")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("id", params.id)
      .maybeSingle();

    // Log para debug
    console.log("Buscando documento:", params.id);
    console.log("Resultado da busca:", { document, error });

    if (error) {
      console.error("Erro ao buscar documento:", error);
      throw error;
    }

    if (!document) {
      console.error("Documento não encontrado:", params.id);
      return notFound();
    }

    // Buscar dados do criador
    const { data: creator } = await supabase
      .from('users')
      .select('*')
      .eq('id', document.created_by)
      .maybeSingle();

    // Get creator name from metadata or email
    const creatorName = creator?.raw_user_meta_data?.full_name || 
                       creator?.raw_user_meta_data?.name || 
                       (creator?.email ? creator.email.split('@')[0] : 'Usuário Desconhecido');

    try {
      // Record view
      await supabase.from("user_document_views").upsert(
        {
          document_id: document.id,
          user_id: user.id,
          viewed_at: new Date().toISOString(),
        },
        { onConflict: "document_id,user_id" },
      );
    } catch (viewError) {
      console.error("Erro ao registrar visualização:", viewError);
    }

    // Format date
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return (
      <>
        <div className="mb-6">
          <Link href="/documents">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              <span>Voltar para Documentos</span>
            </Button>
          </Link>
        </div>

        <div className="bg-background rounded-lg shadow-sm border border-border">
          {/* Document Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{document.title}</h1>
                {document.description && (
                  <p className="text-muted-foreground mt-2">
                    {document.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {document.category && (
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm">
                    {document.category.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Atualizado em {formatDate(document.updated_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>Criado por {creatorName}</span>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="p-6">
            {document.content ? (
              <DocumentContent html={document.content} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">
                  Conteúdo do documento indisponível
                </h3>
                <p className="text-muted-foreground mt-1">
                  Este documento não possui conteúdo ou está armazenado como um
                  arquivo anexo.
                </p>
              </div>
            )}
          </div>

          {/* Document Feedback */}
          <div className="p-6 bg-muted/30 border-t border-border">
            <DocumentFeedback documentId={document.id} />
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Erro ao carregar a página do documento:", error);
    return notFound();
  }
}
