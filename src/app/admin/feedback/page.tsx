import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";
import DocumentsNavbar from "@/components/documents-navbar";
import FeedbackPanel from "@/components/feedback-panel";

export default async function AdminFeedbackPage() {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Verificar se o usuário é admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    return redirect("/documents");
  }

  return (
    <div className="min-h-screen bg-background">
      <DocumentsNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Painel de Feedbacks</h1>
          <FeedbackPanel />
        </div>
      </main>
    </div>
  );
} 