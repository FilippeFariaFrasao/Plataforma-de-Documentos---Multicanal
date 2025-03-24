"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Filter } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { createClient } from "../../supabase/client";
import type { Category } from "@/types/documents";

interface DocumentSearchProps {
  initialSearchTerm?: string;
}

export default function DocumentSearch({ initialSearchTerm = "" }: DocumentSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm && selectedCategories.length === 0) {
      return; // Não fazer busca se não houver termo ou categorias selecionadas
    }

    // Redirecionar para a página de documentos com os parâmetros de busca
    const searchParams = new URLSearchParams();

    if (searchTerm) {
      searchParams.set("q", searchTerm);
    }

    if (selectedCategories.length > 0) {
      searchParams.set("categories", selectedCategories.join(","));
    }

    const queryString = searchParams.toString();
    window.location.href = `/documents${queryString ? `?${queryString}` : ""}`;
  };

  useEffect(() => {
    setMounted(true);

    const fetchCategories = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  // Only render on client side
  if (!mounted) {
    // Return empty div with same dimensions to prevent layout shift
    return (
      <div className="w-full bg-background rounded-lg shadow-sm border border-border p-4 h-[62px]" />
    );
  }

  return (
    <div className="w-full bg-background rounded-lg shadow-sm border border-border p-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-grow">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            type="text"
            placeholder="Buscar em títulos e conteúdo dos documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-foreground">Filtrar por Departamento</h4>
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground">Carregando...</div>
                ) : categories.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Nenhum departamento encontrado
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label
                        htmlFor={category.id}
                        className="text-sm font-normal text-foreground"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button
          type="submit"
          disabled={!searchTerm && selectedCategories.length === 0}
        >
          Buscar
        </Button>
      </form>
    </div>
  );
}
