"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Plus, MessageSquare } from "lucide-react";
import UserProfile from "./user-profile";
import { usePermissions } from "@/hooks/use-permissions";
import { ThemeToggle } from "./theme-toggle";

export default function DocumentsNavbar() {
  const { canCreate, isAdmin } = usePermissions();

  return (
    <nav className="w-full border-b border-border bg-background py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" prefetch className="text-xl font-bold text-foreground">
            Multicanal Docs
          </Link>
          <div className="hidden md:flex gap-4">
            <Link
              href="/documents"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Todos os Documentos
            </Link>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <ThemeToggle />
          {isAdmin && (
            <Link href="/admin/feedback">
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedbacks
              </Button>
            </Link>
          )}
          {canCreate && (
            <Link href="/documents/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Documento
              </Button>
            </Link>
          )}
          <UserProfile />
        </div>
      </div>
    </nav>
  );
}
