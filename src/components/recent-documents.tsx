"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface RecentDocument {
  id: string;
  title: string;
  updated_at: string;
}

export default function RecentDocuments() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-foreground hover:text-foreground hover:bg-muted"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <Clock className="h-4 w-4" />
        <span>Visualizados Recentemente</span>
      </Button>

      {isExpanded && (
        <div className="pl-6 space-y-1">
          {/* Aqui você pode adicionar a lógica para buscar e exibir os documentos recentes */}
          <p className="text-sm text-muted-foreground">Nenhum documento recente</p>
        </div>
      )}
    </div>
  );
} 