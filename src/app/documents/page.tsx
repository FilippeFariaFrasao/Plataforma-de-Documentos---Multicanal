import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import DocumentsNavbar from "@/components/documents-navbar";
import DocumentSearch from "@/components/document-search";
import DocumentCategories from "@/components/document-categories";
import RecentlyViewed from "@/components/recently-viewed";
import DocumentGrid from "@/components/document-grid";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: { 
    category?: string;
    q?: string;
  };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  // Fetch recently viewed documents
  const { data: recentlyViewed } = await supabase
    .from("user_document_views")
    .select(`*, document:documents(*, category:categories(*))`)
    .eq("user_id", user.id)
    .order("viewed_at", { ascending: false })
    .limit(5);

  // Build query for documents
  let query = supabase
    .from("documents")
    .select(`*, category:categories(*)`)
    .order("updated_at", { ascending: false });

  // Apply search filter if specified
  if (searchParams.q) {
    const searchTerm = `%${searchParams.q}%`;
    query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`);
  }

  // Apply category filter if specified
  if (searchParams.category) {
    query = query.eq("category_id", searchParams.category);
  }

  // Fetch filtered documents
  const { data: documents } = await query;

  return (
    <div className="min-h-screen bg-background">
      <DocumentsNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold">Portal de Documentação</h1>

          <DocumentSearch initialSearchTerm={searchParams.q} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <DocumentCategories categories={categories || []} />
            </div>

            <div className="lg:col-span-3 space-y-8">
              <RecentlyViewed
                documents={recentlyViewed?.map((item) => item.document) || []}
              />
              <DocumentGrid documents={documents || []} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
