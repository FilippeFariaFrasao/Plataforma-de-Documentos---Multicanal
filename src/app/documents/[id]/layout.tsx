import { ReactNode } from "react";
import DocumentsNavbar from "@/components/documents-navbar";

export default function DocumentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DocumentsNavbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 