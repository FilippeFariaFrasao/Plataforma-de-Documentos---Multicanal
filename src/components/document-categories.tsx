"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Category } from "@/types/documents";
import { ChevronRight, FolderOpen } from "lucide-react";
import Link from "next/link";

interface DocumentCategoriesProps {
  categories: Category[];
}

export default function DocumentCategories({
  categories = [],
}: DocumentCategoriesProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border p-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Departamentos</h2>

      {categories.length === 0 ? (
        <div className="text-muted-foreground text-sm py-2">
          Nenhum departamento encontrado
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={expandedCategories}
          className="space-y-1"
        >
          {categories.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border-b-0"
            >
              <AccordionTrigger
                onClick={() => toggleCategory(category.id)}
                className="py-2 px-3 hover:bg-muted rounded-md text-sm text-foreground"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-blue-500" />
                  <span>{category.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-6">
                <div className="space-y-1 py-1">
                  <Link
                    href={`/documents?category=${category.id}`}
                    className="flex items-center gap-2 py-1 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  >
                    <ChevronRight size={14} />
                    <span>Todos os Documentos do Departamento {category.name}</span>
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
