"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";
import { Star, FileText, User, Calendar, Clock, Search, Filter, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "./ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface Feedback {
  id: string;
  document_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  document?: {
    title: string;
    category_id?: string;
    category?: {
      id: string;
      name: string;
    };
  };
  user?: {
    email: string;
    name?: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function FeedbackPanel() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedbacks();
    fetchCategories();
  }, []);

  // Aplicar filtros sempre que os feedbacks ou os filtros mudarem
  useEffect(() => {
    applyFilters();
  }, [feedbacks, ratingFilter, categoryFilter, searchTerm]);

  // Buscar categorias para o filtro
  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        return;
      }

      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  // Aplicar filtros aos feedbacks
  const applyFilters = () => {
    let result = [...feedbacks];

    // Filtrar por avaliação
    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter);
      result = result.filter((feedback) => feedback.rating === rating);
    }

    // Filtrar por categoria
    if (categoryFilter !== "all") {
      result = result.filter(
        (feedback) => feedback.document?.category?.id === categoryFilter
      );
    }

    // Filtrar por termo de busca
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (feedback) =>
          (feedback.document?.title && feedback.document.title.toLowerCase().includes(term)) ||
          (feedback.comment && feedback.comment.toLowerCase().includes(term)) ||
          (feedback.user?.name && feedback.user.name.toLowerCase().includes(term)) ||
          (feedback.user?.email && feedback.user.email.toLowerCase().includes(term))
      );
    }

    setFilteredFeedbacks(result);
  };

  const fetchFeedbacks = async () => {
    try {
      console.log("Iniciando busca de feedbacks...");
      setError(null);
      setIsLoading(true);
      const supabase = createClient();
      
      // Verificar autenticação do usuário
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Erro de autenticação:", authError);
        setError("Erro de autenticação: " + authError.message);
        toast({
          title: "Erro de autenticação",
          description: authError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (!user) {
        console.error("Usuário não autenticado");
        setError("Você precisa estar autenticado para ver os feedbacks");
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para ver os feedbacks.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("Usuário autenticado:", user.id);

      // Verificar informações do usuário
      try {
        console.log("Verificando a estrutura do banco de dados...");
        
        // Verificar permissões do usuário atual
        const { data: userRoleData, error: userRoleError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id);
          
        if (userRoleError) {
          console.error("Erro ao verificar permissões do usuário:", userRoleError);
        } else {
          console.log("Dados do usuário:", userRoleData);
        }
      } catch (e) {
        console.warn("Erro ao verificar estrutura do banco:", e);
      }

      // Em vez de tentar usar relacionamentos que podem não existir, vamos buscar os dados separadamente
      // 1. Primeiro buscar os feedbacks
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("document_feedback")
        .select("*")
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error("Erro ao buscar feedbacks:", feedbackError);
        setError("Erro ao buscar feedbacks: " + feedbackError.message);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os feedbacks: " + feedbackError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        setFeedbacks([]);
        setFilteredFeedbacks([]);
        return;
      }

      console.log("Resultado da consulta de feedbacks:", { 
        data: feedbackData ? "Sim" : "Não", 
        quantidade: feedbackData?.length || 0
      });
      
      // Verificar se há dados
      if (!feedbackData || feedbackData.length === 0) {
        console.log("Nenhum feedback encontrado na tabela");
        setIsLoading(false);
        setFeedbacks([]);
        setFilteredFeedbacks([]);
        return;
      }

      // 2. Buscar documentos relacionados
      const documentIds = Array.from(new Set(feedbackData.map(f => f.document_id)));
      const { data: documentsData, error: documentsError } = await supabase
        .from("documents")
        .select(`
          id, 
          title, 
          category_id, 
          category:categories(id, name)
        `)
        .in('id', documentIds);

      if (documentsError) {
        console.warn("Erro ao buscar documentos:", documentsError);
      }

      // 3. Buscar usuários relacionados
      const userIds = Array.from(new Set(feedbackData.map(f => f.user_id)));
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, name")
        .in('id', userIds);

      if (usersError) {
        console.warn("Erro ao buscar usuários:", usersError);
      }

      // 4. Combinar os dados
      const documentsMap: Record<string, any> = {};
      if (documentsData) {
        documentsData.forEach(doc => {
          documentsMap[doc.id] = doc;
        });
      }

      const usersMap: Record<string, any> = {};
      if (usersData) {
        usersData.forEach(user => {
          usersMap[user.id] = user;
        });
      }

      // Combinar os dados na estrutura esperada
      const enrichedFeedbacks = feedbackData.map(feedback => ({
        ...feedback,
        document: documentsMap[feedback.document_id] || { title: `Documento ID: ${feedback.document_id}` },
        user: usersMap[feedback.user_id] || { email: `Usuário ID: ${feedback.user_id}` }
      }));

      setFeedbacks(enrichedFeedbacks);
      setFilteredFeedbacks(enrichedFeedbacks);
    } catch (error: any) {
      console.error("Erro não tratado:", error);
      setError("Erro inesperado: " + (error.message || "Desconhecido"));
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado: " + (error.message || "Desconhecido"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para criar um feedback de teste
  const createTestFeedback = async () => {
    try {
      setIsCreating(true);
      const supabase = createClient();
      
      // Verificar autenticação do usuário
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado para criar um feedback de teste.",
          variant: "destructive",
        });
        return;
      }

      // Verificar se já existe um documento
      let document_id;
      const { data: documents } = await supabase
        .from("documents")
        .select("id, title")
        .limit(1);
        
      if (documents && documents.length > 0) {
        document_id = documents[0].id;
      } else {
        // Criar um documento de teste se não existir
        const { data: newDoc, error: docError } = await supabase
          .from("documents")
          .insert({
            title: "Documento de teste",
            description: "Documento criado para teste de feedback",
            user_id: user.id,
            content: "Conteúdo de teste",
            is_restricted: false,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();
          
        if (docError) {
          console.error("Erro ao criar documento:", docError);
          toast({
            title: "Erro",
            description: "Não foi possível criar um documento para o feedback de teste.",
            variant: "destructive",
          });
          return;
        }
        
        document_id = newDoc.id;
      }
      
      // Criar feedback de teste
      const { error: feedbackError } = await supabase
        .from("document_feedback")
        .insert({
          document_id,
          user_id: user.id,
          rating: 5,
          comment: "Este é um feedback de teste.",
          created_at: new Date().toISOString()
        });
        
      if (feedbackError) {
        console.error("Erro ao criar feedback:", feedbackError);
        toast({
          title: "Erro",
          description: "Não foi possível criar o feedback de teste: " + feedbackError.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Sucesso",
        description: "Feedback de teste criado com sucesso!",
      });
      
      // Recarregar os feedbacks
      await fetchFeedbacks();
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o feedback de teste: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetFilters = () => {
    setRatingFilter("all");
    setCategoryFilter("all");
    setSearchTerm("");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Renderização de loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Renderização de erro
  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-destructive text-lg font-semibold">Erro</div>
        <p>{error}</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={fetchFeedbacks}>Tentar novamente</Button>
          <Button 
            onClick={createTestFeedback} 
            variant="outline" 
            disabled={isCreating}
          >
            {isCreating ? "Criando..." : "Criar feedback de teste"}
          </Button>
        </div>
      </div>
    );
  }

  // Renderização quando não há feedbacks
  if (feedbacks.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Nenhum feedback encontrado no sistema.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button onClick={fetchFeedbacks}>Atualizar</Button>
          <Button 
            onClick={createTestFeedback} 
            variant="outline" 
            disabled={isCreating}
          >
            {isCreating ? "Criando..." : "Criar feedback de teste"}
          </Button>
        </div>
      </div>
    );
  }

  // Renderização normal dos feedbacks
  return (
    <div className="space-y-6">
      {/* Barra de filtros e pesquisa */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Filtros e Pesquisa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-auto flex-grow">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar por título, comentário ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="rating-filter">Avaliação</Label>
                <Select
                  value={ratingFilter}
                  onValueChange={setRatingFilter}
                >
                  <SelectTrigger id="rating-filter" className="w-full md:w-[200px]">
                    <SelectValue placeholder="Todas as avaliações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as avaliações</SelectItem>
                    <SelectItem value="5">5 estrelas</SelectItem>
                    <SelectItem value="4">4 estrelas</SelectItem>
                    <SelectItem value="3">3 estrelas</SelectItem>
                    <SelectItem value="2">2 estrelas</SelectItem>
                    <SelectItem value="1">1 estrela</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="category-filter">Categoria</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger id="category-filter" className="w-full md:w-[200px]">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={resetFilters}
              title="Limpar filtros"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredFeedbacks.length} de {feedbacks.length} feedback(s)
        </div>
        <div>
          <Button onClick={fetchFeedbacks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-lg shadow-sm border border-border divide-y divide-border">
        {filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <h3 className="font-medium text-foreground">
                    {feedback.document?.title || `Documento ID: ${feedback.document_id}`}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{feedback.user?.name || feedback.user?.email || `Usuário ID: ${feedback.user_id}`}</span>
                  <span className="mx-1">•</span>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(feedback.created_at)}</span>
                  <span className="mx-1">•</span>
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(feedback.created_at)}</span>
                </div>
                {feedback.document?.category && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span className="bg-muted rounded-full px-2 py-1">
                      {feedback.document.category.name}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= feedback.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {feedback.comment && (
              <div className="mt-4 bg-muted/30 rounded-md p-4 text-muted-foreground text-sm">
                "{feedback.comment}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 