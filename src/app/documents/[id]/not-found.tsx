import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import DocumentsNavbar from "@/components/documents-navbar";

export default function DocumentNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <DocumentsNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/documents">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <span>Voltar para Documentos</span>
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Documento não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O documento que você está procurando não existe ou foi removido.
          </p>
          <Link href="/documents">
            <Button>Voltar para a lista de documentos</Button>
          </Link>
        </div>
      </main>
    </div>
  );
} 