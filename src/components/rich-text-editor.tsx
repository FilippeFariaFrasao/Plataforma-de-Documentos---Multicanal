"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { ImagePlus, Bold, Italic, List, ListOrdered, Heading1, Heading2 } from "lucide-react";
import { createClient } from "@/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isEditing = useRef(false);
  const prevValueRef = useRef(value);
  const initialRenderRef = useRef(true);

  // Configuração inicial e tema
  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setIsDarkMode(isDark);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Inicializar o editor com o conteúdo inicial assim que estiver montado
  useEffect(() => {
    if (editorRef.current && mounted && initialRenderRef.current) {
      editorRef.current.innerHTML = value || '';
      prevValueRef.current = value;
      initialRenderRef.current = false;
    }
  }, [value, mounted]);

  // Atualizar o conteúdo do editor quando o valor mudar e não estiver sendo editado
  useEffect(() => {
    // Não atualizar se o editor não estiver montado ou se o usuário estiver editando
    if (!editorRef.current || isEditing.current || initialRenderRef.current) return;
    
    // Não atualizar se o valor for o mesmo que já está no editor
    if (value === prevValueRef.current) return;
    
    // Atualizar o conteúdo do editor com o novo valor
    editorRef.current.innerHTML = value || '';
    prevValueRef.current = value;
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isEditing.current = true;
    const newContent = e.currentTarget.innerHTML;
    prevValueRef.current = newContent;
    onChange(newContent);
  };

  const handleFocus = () => {
    isEditing.current = true;
  };

  const handleBlur = () => {
    isEditing.current = false;
  };

  const handleFormat = (tag: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const element = document.createElement(tag);
    
    try {
      element.textContent = range.toString();
      range.deleteContents();
      range.insertNode(element);
      
      const newContent = editorRef.current.innerHTML;
      prevValueRef.current = newContent;
      onChange(newContent);
    } catch (error) {
      console.error('Erro ao formatar texto:', error);
    }
  };

  const uploadImage = async (file: File) => {
    if (!editorRef.current) return;

    try {
      const supabase = createClient();
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("A imagem deve ter no máximo 5MB");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("O arquivo deve ser uma imagem");
      }
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type
        });

      if (uploadError) throw uploadError;
      if (!data?.path) throw new Error("Caminho do arquivo não retornado");

      const { data: { publicUrl } } = supabase.storage
        .from("documents")
        .getPublicUrl(data.path);

      const imageHtml = `<img src="${publicUrl}" alt="${file.name}" />`;
      const selection = window.getSelection();
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const imageElement = document.createElement('div');
        imageElement.innerHTML = imageHtml;
        range.insertNode(imageElement.firstChild!);
      } else {
        editorRef.current.innerHTML += imageHtml;
      }

      const newContent = editorRef.current.innerHTML;
      prevValueRef.current = newContent;
      onChange(newContent);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      alert(error instanceof Error ? error.message : "Erro ao fazer upload da imagem");
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) await uploadImage(file);
    };
    input.click();
  };

  if (!mounted) {
    return <div className="min-h-[400px] w-full border border-border rounded-md bg-muted/20" />;
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <div className="bg-background border-b p-2 flex gap-2 flex-wrap items-center">
        <div className="flex gap-1 items-center border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('strong')}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('em')}
          >
            <Italic className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1 items-center border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('h1')}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('h2')}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1 items-center border-r pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('ul')}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('ol')}
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImageUpload}
        >
          <ImagePlus className="w-4 h-4 mr-2" />
          Adicionar Imagem
        </Button>
      </div>
      <div 
        ref={editorRef}
        className={cn(
          "p-4 min-h-[500px] w-full bg-background text-foreground outline-none",
          "prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-foreground",
          "prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground",
          className
        )}
        contentEditable
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        spellCheck="true"
        lang="pt-BR"
        style={{ direction: 'ltr', unicodeBidi: 'normal' }}
      />
    </div>
  );
}