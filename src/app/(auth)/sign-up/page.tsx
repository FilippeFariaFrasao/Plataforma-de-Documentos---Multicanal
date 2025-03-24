import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signUpAction } from "@/app/actions";
import Navbar from "@/components/navbar";
import { UrlProvider } from "@/components/url-provider";

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="flex h-screen w-full flex-1 items-center justify-center p-4 sm:max-w-md">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <UrlProvider>
            <form className="flex flex-col space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-semibold tracking-tight">Cadastrar</h1>
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link
                    className="text-primary font-medium hover:underline transition-all"
                    href="/sign-in"
                  >
                    Entrar
                  </Link>
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium">
                    Nome Completo
                  </Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="João Silva"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu.email@multicanalatacado.com.br"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Sua senha"
                    minLength={6}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <SubmitButton
                formAction={signUpAction}
                pendingText="Cadastrando..."
                className="w-full"
              >
                Cadastrar
              </SubmitButton>

              <FormMessage message={searchParams} />
            </form>
          </UrlProvider>
        </div>
      </div>
    </>
  );
}
