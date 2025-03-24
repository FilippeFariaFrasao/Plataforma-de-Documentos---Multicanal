"use client";

import { Document } from "@/types/documents";
import { FileText, Calendar, Star, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface DocumentGridProps {
  documents: Document[];
}

export default function DocumentGrid({ documents = [] }: DocumentGridProps) {
  const [sortBy, setSortBy] = useState<"title" | "updated_at">("updated_at");
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { canEdit, canDelete, isLoading } = usePermissions();

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Sort documents based on selected sort option
  const sortedDocuments = [...documents].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else {
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }
  });

  // Função para limpar o conteúdo HTML de forma mais robusta
  const cleanContent = (html: string) => {
    // Verificar se existe conteúdo
    if (!html) return '';
    
    try {
      // Usar abordagem simples e consistente entre servidor e cliente
      const strippedHtml = html
        .replace(/<[^>]*>/g, ' ')  // remove todas as tags HTML
        .replace(/&nbsp;/g, ' ')    // substitui espaços HTML por espaços normais
        .replace(/\s+/g, ' ')       // normaliza espaços múltiplos para um único
        .trim();                    // remove espaços no início e fim
      
      // Limitar a 120 caracteres para menor chance de erro
      return strippedHtml.substring(0, 120) + (strippedHtml.length > 120 ? '...' : '');
    } catch (error) {
      // Em caso de erro, retorna uma string vazia para não quebrar a UI
      console.error('Erro ao processar conteúdo HTML:', error);
      return '';
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentToDelete.id);

      if (error) throw error;

      router.refresh();
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Todos os Documentos</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ordenar por:</span>
          <Button
            variant={sortBy === "title" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("title")}
          >
            Nome
          </Button>
          <Button
            variant={sortBy === "updated_at" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("updated_at")}
          >
            Recentes
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-muted-foreground text-sm py-8 text-center">
          Nenhum documento encontrado. Crie seu primeiro documento para começar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="group border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-card"
            >
              <div className="bg-muted p-4 flex items-center justify-between border-b border-border">
                <FileText size={40} className="text-blue-500" />
                {(canEdit || canDelete) && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canEdit && (
                      <Link href={`/documents/${doc.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDocumentToDelete(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <Link href={`/documents/${doc.id}`}>
                <div className="p-4">
                  <h3 className="font-medium text-foreground group-hover:text-blue-600 transition-colors">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                  {doc.content && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {cleanContent(doc.content)}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(doc.updated_at)}</span>
                    </div>
                    {doc.category && (
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full">
                        {doc.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!documentToDelete} onOpenChange={() => setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o documento "{documentToDelete?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
