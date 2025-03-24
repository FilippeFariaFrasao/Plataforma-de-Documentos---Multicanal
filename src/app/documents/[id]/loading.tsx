import { Loader2 } from "lucide-react";
import DocumentsNavbar from "@/components/documents-navbar";

export default function DocumentLoading() {
  return (
    <div className="min-h-screen bg-background">
      <DocumentsNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Carregando documento...</p>
          </div>
        </div>
      </main>
    </div>
  );
} 