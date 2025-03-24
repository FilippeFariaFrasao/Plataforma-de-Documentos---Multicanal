'use client';

import { Document } from "@/types/documents";
import { Clock, FileText, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface RecentlyViewedProps {
  documents: Document[];
}

// Função para formatar o tempo relativo de forma segura para hidratação
const formatRelativeTime = (dateString: string) => {
  // Durante a hidratação inicial, retorne apenas a data formatada
  // para garantir consistência entre servidor e cliente
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export default function RecentlyViewed({
  documents = [],
}: RecentlyViewedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Após a montagem do componente, podemos usar formatação dinâmica
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Função dinâmica para formatar tempo relativo (só usada após a montagem)
  const getDynamicRelativeTime = (dateString: string) => {
    if (!isMounted) return formatRelativeTime(dateString);
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutos atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} horas atrás`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
    
    return formatRelativeTime(dateString);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-background rounded-lg shadow-sm border border-border p-4 space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-foreground hover:text-foreground hover:bg-muted"
        >
          <Clock className="h-4 w-4" />
          <span>Visualizados Recentemente</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        {documents.length === 0 ? (
          <div className="text-muted-foreground text-sm py-2">
            Nenhum documento visualizado recentemente
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/${doc.id}`}
                className="flex items-start gap-3 p-2 hover:bg-muted rounded-md transition-colors"
              >
                <FileText size={18} className="text-blue-500 mt-0.5" />
                <div className="flex-grow">
                  <h3 className="font-medium text-sm text-foreground">{doc.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {doc.category && (
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded-full">
                        {doc.category.name}
                      </span>
                    )}
                    <span>{getDynamicRelativeTime(doc.updated_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
