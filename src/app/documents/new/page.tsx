import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import DocumentsNavbar from "@/components/documents-navbar";
import { DocumentForm } from "@/components/document-form";

export default async function NewDocumentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch categories for the form
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="min-h-screen bg-background">
      <DocumentsNavbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Criar Novo Documento</h1>
        <div className="w-full">
          <DocumentForm categories={categories || []} />
        </div>
      </main>
    </div>
  );
}
