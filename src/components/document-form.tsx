"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Category } from "@/types/documents";
import { createClient } from "@/supabase/client";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "./rich-text-editor";
import { useUser } from "@/hooks/use-user";
import { useToast } from "./ui/use-toast";

interface DocumentFormProps {
  document?: {
    id: string;
    title: string;
    description: string;
    content: string;
    category_id: string;
    is_restricted: boolean;
  };
  categories: Category[];
}

export function DocumentForm({ document, categories }: DocumentFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: document?.title || "",
    description: document?.description || "",
    content: document?.content || "",
    category_id: document?.category_id || "",
    is_restricted: document?.is_restricted || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se o usuário está logado
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um documento.",
        variant: "destructive",
      });
      return;
    }

    // Validar campos obrigatórios
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push("O título é obrigatório");
    }
    
    if (!formData.category_id) {
      errors.push("Selecione uma categoria");
    }
    
    // Se houver erros, mostrar notificação e não prosseguir
    if (errors.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: (
          <ul className="list-disc pl-4">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const documentData = {
        ...formData,
        created_by: user.id,
        // Garantir que os campos não estão vazios
        description: formData.description || null,
        content: formData.content || null,
      };

      let error;

      if (document?.id) {
        const { error: updateError } = await supabase
          .from("documents")
          .update(documentData)
          .eq("id", document.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("documents")
          .insert([documentData]);
        error = insertError;
      }

      if (error) {
        console.error("Erro detalhado:", error);
        let errorMessage = "Ocorreu um erro ao salvar o documento. Tente novamente.";
        
        // Mapear erros comuns para mensagens amigáveis
        if (error.message?.includes("invalid input syntax for type uuid")) {
          errorMessage = "Um campo obrigatório não foi preenchido corretamente.";
        } else if (error.message?.includes("violates foreign key constraint")) {
          errorMessage = "A categoria selecionada não é válida ou não existe.";
        } else if (error.message?.includes("duplicate key")) {
          errorMessage = "Já existe um documento com este título.";
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Sucesso",
        description: document?.id
          ? "Documento atualizado com sucesso!"
          : "Documento criado com sucesso!",
      });

      router.push("/documents");
      router.refresh();
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full">
      <div className="space-y-2">
        <Label htmlFor="title" className="flex items-center">
          Título <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Digite o título do documento"
          className={`w-full ${!formData.title.trim() ? "border-red-300 focus-visible:ring-red-500" : ""}`}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Descrição
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Digite uma breve descrição do documento"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="flex items-center">
          Categoria <span className="text-red-500 ml-1">*</span>
        </Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, category_id: value }))
          }
        >
          <SelectTrigger className={`w-full ${!formData.category_id ? "border-red-300" : ""}`}>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Conteúdo</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, content: value }))
          }
          className="min-h-[500px] w-full"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_restricted"
          checked={formData.is_restricted}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, is_restricted: checked }))
          }
        />
        <Label htmlFor="is_restricted">Restrito</Label>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="text-sm text-muted-foreground">
          <span className="text-red-500">*</span> Campos obrigatórios
        </div>
        <Button type="submit" disabled={isLoading} className="self-end">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : document?.id ? (
            "Atualizar"
          ) : (
            "Criar"
          )}
        </Button>
      </div>
    </form>
  );
}
