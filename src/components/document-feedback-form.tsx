"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Star } from "lucide-react";
import { createClient } from "../../supabase/client";

interface DocumentFeedbackFormProps {
  documentId: string;
}

export default function DocumentFeedbackForm({
  documentId,
}: DocumentFeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Buscar ID do usuário atual ao montar o componente
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        setError("Erro ao identificar usuário. Por favor, faça login novamente.");
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating) {
      setError("Por favor, forneça uma avaliação");
      return;
    }

    if (!userId) {
      setError("Não foi possível identificar o usuário. Por favor, faça login novamente.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      console.log("Enviando feedback:", {
        document_id: documentId,
        user_id: userId,
        rating,
        comment: comment.trim() || null,
      });

      const { error, data } = await supabase.from("document_feedback").insert({
        document_id: documentId,
        user_id: userId,
        rating,
        comment: comment.trim() || null,
      });

      if (error) {
        console.error("Erro detalhado:", error);
        throw error;
      }
      
      console.log("Feedback inserido com sucesso:", data);

      setIsSubmitted(true);
      setComment("");
      setRating(null);
    } catch (err: any) {
      console.error("Erro ao enviar feedback:", err);
      setError(err.message || "Falha ao enviar feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-4">
        <h3 className="text-lg font-medium mb-2">
          Obrigado pelo seu feedback!
        </h3>
        <p className="text-muted-foreground">
          Sua opinião nos ajuda a melhorar nossa documentação.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Feedback do Documento</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-sm font-medium">Avalie este documento:</span>
            <div className="flex items-center ml-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                >
                  <Star
                    size={20}
                    className={`${rating && rating >= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} hover:text-yellow-400`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            placeholder="Você tem alguma sugestão para melhorar este documento?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Feedback"}
        </Button>
      </form>
    </div>
  );
}
