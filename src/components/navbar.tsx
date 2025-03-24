import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { signOutAction } from "@/app/actions";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full border-b border-border bg-background py-2">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" prefetch className="text-xl font-bold text-foreground">
          Multicanal Docs
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link href="/documents">
                <Button variant="outline" size="sm">
                  Documentação
                </Button>
              </Link>
              <form action={signOutAction}>
                <Button variant="ghost" size="sm" type="submit" className="flex items-center gap-2">
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </form>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  Entrar
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">
                  Cadastrar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
