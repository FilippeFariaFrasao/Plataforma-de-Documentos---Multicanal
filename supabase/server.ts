import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type CookieOptions } from "@supabase/ssr";

export const createClient = async () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Ignorar erro de cookies em contextos fora de Server Actions ou Route Handlers
            console.warn('Aviso: cookies só podem ser modificados em Server Actions ou Route Handlers');
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete({ name, ...options });
          } catch (error) {
            // Ignorar erro de cookies em contextos fora de Server Actions ou Route Handlers
            console.warn('Aviso: cookies só podem ser modificados em Server Actions ou Route Handlers');
          }
        },
      },
    }
  );
};
