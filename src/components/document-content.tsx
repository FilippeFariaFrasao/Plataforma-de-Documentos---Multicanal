"use client";

import { useEffect, useState } from "react";

interface DocumentContentProps {
  html: string;
}

export default function DocumentContent({ html }: DocumentContentProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Garantir que temos uma string válida
  const safeHtml = html || '';

  // Durante a renderização do servidor ou antes da hidratação,
  // use uma versão simplificada do HTML
  if (!isMounted) {
    // Remover todas as tags para simplificar a representação no servidor
    // Isso garante que o servidor e o cliente concordem durante a hidratação
    const plainText = safeHtml
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    return (
      <div className="prose dark:prose-invert max-w-none">
        {plainText.length > 0 ? <p>{plainText}</p> : <p>Carregando conteúdo...</p>}
      </div>
    );
  }

  // Após a montagem do componente, podemos renderizar o HTML completo
  return (
    <div 
      className="prose dark:prose-invert max-w-none prose-img:rounded-lg prose-headings:text-foreground prose-p:text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
} 