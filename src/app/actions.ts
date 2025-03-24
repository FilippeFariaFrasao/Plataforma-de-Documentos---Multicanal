"use server";

import { encodedRedirect } from "@/utils/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";

// Armazenamento temporário para rastrear tentativas de login (em produção, use Redis ou similar)
// Este é um exemplo simples - em produção, use um armazenamento persistente
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();

// Limite de tentativas e período de bloqueio
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000; // 15 minutos

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString() || "";
  const supabase = await createClient();
  const origin = headers().get("origin");
  
  // Coletar informações para os logs de segurança
  const ipAddress = headers().get("x-forwarded-for") || "unknown";
  const userAgent = headers().get("user-agent") || "unknown";

  if (!email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email e senha são obrigatórios",
    );
  }

  // Validar o domínio do e-mail
  if (!email.endsWith("@multicanalatacado.com.br")) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Apenas e-mails corporativos (@multicanalatacado.com.br) são permitidos",
    );
  }

  // Validação de senha forte
  if (password.length < 8) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "A senha deve ter pelo menos 8 caracteres"
    );
  }

  // Verificar se a senha contém pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "A senha deve conter pelo menos uma letra maiúscula"
    );
  }

  // Verificar se a senha contém pelo menos um número
  if (!/[0-9]/.test(password)) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "A senha deve conter pelo menos um número"
    );
  }

  // Verificar se a senha contém pelo menos um caractere especial
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "A senha deve conter pelo menos um caractere especial"
    );
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
        email: email,
      },
    },
  });

  console.log("After signUp", error);

  if (error) {
    console.error(error.code + " " + error.message);
    
    return encodedRedirect("error", "/sign-up", error.message);
  }

  if (user) {
    try {
      // First check if the user already exists in the users table
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existingUser) {
        // Only insert if the user doesn't already exist
        const { error: updateError } = await supabase.from("users").insert({
          id: user.id,
          name: fullName,
          full_name: fullName,
          email: email,
          user_id: user.id,
          token_identifier: user.id,
          created_at: new Date().toISOString(),
        });

        if (updateError) {
          console.error("Error updating user profile:", updateError);
        }
      } else {
        // User already exists, update instead
        const { error: updateError } = await supabase
          .from("users")
          .update({
            name: fullName,
            full_name: fullName,
            email: email,
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating existing user profile:", updateError);
        }
      }
      
    } catch (err) {
      console.error("Error in user profile creation:", err);
    }
  }

  // Redirecionar diretamente para a página de documentos em vez de mostrar mensagem de verificação
  return redirect("/documents");
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  
  // Coletar informações para os logs de segurança
  const ipAddress = headers().get("x-forwarded-for") || "unknown";
  const userAgent = headers().get("user-agent") || "unknown";

  // Verificar se o email está bloqueado
  const attemptKey = `${email}:${ipAddress}`;
  const now = Date.now();
  
  const userAttempts = loginAttempts.get(attemptKey);
  
  if (userAttempts) {
    // Se houver tentativas anteriores, verificar bloqueio
    const timeSinceLastAttempt = now - userAttempts.lastAttempt;
    
    if (userAttempts.count >= MAX_LOGIN_ATTEMPTS && timeSinceLastAttempt < BLOCK_TIME_MS) {
      // Calcular tempo restante de bloqueio
      const remainingBlockTime = Math.ceil((BLOCK_TIME_MS - timeSinceLastAttempt) / 60000); // em minutos
      return encodedRedirect(
        "error", 
        "/sign-in", 
        `Muitas tentativas de login. Por favor, tente novamente em ${remainingBlockTime} minutos.`
      );
    }
    
    // Se o tempo de bloqueio passou, resetar contagem
    if (timeSinceLastAttempt >= BLOCK_TIME_MS) {
      loginAttempts.set(attemptKey, { count: 1, lastAttempt: now });
    }
  } else {
    // Primeira tentativa para este email/IP
    loginAttempts.set(attemptKey, { count: 1, lastAttempt: now });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Incrementar contador de tentativas em caso de falha
    const currentAttempts = loginAttempts.get(attemptKey);
    
    if (currentAttempts) {
      loginAttempts.set(attemptKey, {
        count: currentAttempts.count + 1,
        lastAttempt: now
      });
      
      // Avisar usuário sobre quantas tentativas restam
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - (currentAttempts.count + 1);
      if (attemptsLeft > 0) {
        return encodedRedirect("error", "/sign-in", `${error.message}. Tentativas restantes: ${attemptsLeft}.`);
      } else {
        return encodedRedirect("error", "/sign-in", `Muitas tentativas de login. Sua conta foi temporariamente bloqueada. Tente novamente em 15 minutos.`);
      }
    }
    
    return encodedRedirect("error", "/sign-in", error.message);
  }

  // Limpar tentativas em caso de sucesso
  loginAttempts.delete(attemptKey);
  
  // Registrar sucesso de login
  if (data?.user) {
    // Sucesso de login
  }

  return redirect("/documents");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = headers().get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/dashboard/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};
