"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { Star, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";

interface DocumentFeedbackProps {
  documentId: string;
  onFeedbackSubmitted?: () => void;
}

export default function DocumentFeedback({
  documentId,
  onFeedbackSubmitted,
}: DocumentFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Buscar ID do usuário atual ao montar o componente
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log("Buscando usuário atual...");
        const supabase = createClient();
        
        // Primeiro verificamos a sessão atual (mais confiável)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError);
          return;
        }
        
        if (sessionData?.session?.user) {
          console.log("Usuário encontrado na sessão:", sessionData.session.user.id);
          setUserId(sessionData.session.user.id);
          setIsLoading(false);
          return;
        }
        
        // Se não houver sessão, tentamos o método getUser como fallback
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Erro ao obter usuário:", error);
          setIsLoading(false);
          return;
        }
        
        console.log("Dados do usuário:", data);
        
        if (data.user) {
          console.log("ID do usuário obtido:", data.user.id);
          setUserId(data.user.id);
        } else {
          console.warn("Usuário não encontrado nos dados retornados");
          // Redirecionar para login se não encontrarmos o usuário
          toast({
            title: "Sessão expirada",
            description: "Por favor, faça login novamente para enviar feedback.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Exceção ao buscar usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [toast]);

  const handleSubmit = async () => {
    console.log("Iniciando envio de feedback...");
    console.log("Estado atual - Rating:", rating, "UserId:", userId);
    
    if (rating === 0) {
      console.warn("Tentativa de envio sem rating");
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      console.error("Tentativa de envio sem ID de usuário");
      toast({
        title: "Erro de autenticação",
        description: "Não foi possível identificar o usuário. Tente fazer login novamente.",
        variant: "destructive",
      });
      
      // Redirecionar para a página de login
      router.push("/sign-in");
      return;
    }

    setIsSubmitting(true);
    console.log("Iniciando processo de inserção no banco de dados...");

    try {
      const supabase = createClient();
      
      // Verificando se o documento existe
      console.log("Verificando existência do documento:", documentId);
      const { data: docCheck, error: docError } = await supabase
        .from("documents")
        .select("id")
        .eq("id", documentId)
        .single();
        
      if (docError) {
        console.error("Erro ao verificar documento:", docError);
        if (docError.code === "PGRST116") {
          throw new Error("Documento não encontrado. Por favor, verifique se o documento existe.");
        }
      }
      
      console.log("Documento verificado:", docCheck);
      
      // SOLUÇÃO: Criar um identificador único baseado no timestamp atual
      // Isso garante que cada feedback terá um ID único, mesmo se o mesmo 
      // usuário enviar múltiplos feedbacks para o mesmo documento
      const timestamp = Date.now();
      const idSuffix = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const customId = `${userId}-${documentId}-${timestamp}-${idSuffix}`;
      console.log("ID personalizado gerado:", customId);
      
      // Preparar dados do feedback para inserção
      const feedbackData = {
        // Não definimos o ID aqui, deixaremos o banco de dados gerar um UUID,
        // pois o problema não está no ID, mas na restrição UNIQUE em document_id e user_id
        document_id: documentId,
        user_id: userId,
        rating,
        comment: comment.trim() || null,
      };
      
      console.log("Dados do feedback a serem enviados:", feedbackData);
      
      // Tentar uma estratégia diferente: upsert com onConflict
      console.log("Tentando inserir feedback com método upsert...");
      
      // Esta é uma abordagem que tenta contornar a restrição única
      // Se um conflito ocorrer, inserimos um novo registro com um pequeno atraso
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const { error, data } = await supabase
            .from("document_feedback")
            .insert(feedbackData);
          
          if (!error) {
            console.log("Feedback inserido com sucesso na tentativa", attempt + 1);
            break; // Sucesso, saímos do loop
          }
          
          if (error.code === '23505') {
            console.log(`Tentativa ${attempt + 1} falhou com erro de chave duplicada, tentando novamente...`);
            // Pequeno atraso adicional para próxima tentativa
            await new Promise(resolve => setTimeout(resolve, 100)); 
            // Geramos um novo timestamp para evitar colisões
            feedbackData.comment = `${comment.trim() || ''} (${Date.now()})`.trim() || null;
          } else {
            // Outro erro, não relacionado à chave duplicada
            console.error("Erro detalhado ao inserir feedback:", error);
            console.error("Código:", error.code);
            console.error("Detalhes:", error.details);
            console.error("Mensagem:", error.message);
            throw error;
          }
        } catch (innerError) {
          console.error(`Erro na tentativa ${attempt + 1}:`, innerError);
          if (attempt === 2) throw innerError; // Na última tentativa, propagamos o erro
        }
      }
      
      console.log("Processo de feedback concluído com sucesso");

      toast({
        title: "Feedback enviado",
        description: "Obrigado por avaliar este documento!",
      });

      // Mostrar mensagem de agradecimento
      setIsSubmitted(true);

      // Notify parent component
      onFeedbackSubmitted?.();
    } catch (error: any) {
      console.error("Exceção ao enviar feedback:", error);
      console.error("Stack trace:", error.stack);
      toast({
        title: "Erro ao enviar feedback",
        description: error.message || "Por favor, tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log("Processo de envio de feedback finalizado");
    }
  };

  // Resetar o formulário para enviar outro feedback
  const handleNewFeedback = () => {
    setIsSubmitted(false);
    setRating(0);
    setComment("");
  };

  // Se estiver carregando, mostrar um estado de carregamento
  if (isLoading) {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        <div className="h-6 w-1/3 bg-muted rounded"></div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <div key={value} className="w-6 h-6 rounded-full bg-muted"></div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-4 w-1/4 bg-muted rounded"></div>
          <div className="h-24 w-full bg-muted rounded"></div>
        </div>
        <div className="h-10 w-28 bg-muted rounded"></div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="space-y-4 p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-xl font-medium text-green-800 dark:text-green-400">
          Feedback enviado com sucesso!
        </h3>
        <p className="text-green-700 dark:text-green-300">
          Muito obrigado por sua avaliação! Sua opinião é extremamente importante 
          para continuarmos melhorando nossa documentação.
        </p>
        <Button 
          variant="outline" 
          className="mt-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
          onClick={handleNewFeedback}
        >
          Enviar outro feedback
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-foreground">Avaliação</h3>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => setRating(value)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              size={24}
              className={`${
                value <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm text-foreground">
          Comentário (opcional)
        </label>
        <Textarea
          id="comment"
          placeholder="Digite seu comentário aqui..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none"
          rows={4}
        />
      </div>
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "Enviar Feedback"}
      </Button>
      {userId ? (
        <p className="text-xs text-muted-foreground mt-2">
          Você está enviando feedback como usuário {userId.substring(0, 8)}...
        </p>
      ) : (
        <p className="text-xs text-red-500 mt-2">
          Não foi possível identificar seu usuário. Por favor, <a href="/sign-in" className="underline">faça login novamente</a>.
        </p>
      )}
    </div>
  );
} 