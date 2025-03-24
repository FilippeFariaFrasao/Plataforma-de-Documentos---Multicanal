"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DocumentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na página do documento:", error);
  }, [error]);

  return (
    <>
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
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Algo deu errado</h1>
        <p className="text-muted-foreground mb-6">
          Ocorreu um erro ao carregar o documento. Por favor, tente novamente.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => reset()}>Tentar novamente</Button>
          <Link href="/documents">
            <Button variant="outline">Voltar para a lista</Button>
          </Link>
        </div>
      </div>
    </>
  );
} 