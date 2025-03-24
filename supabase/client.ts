import { createBrowserClient } from "@supabase/ssr";
import { throttle } from "lodash";

// Cache para armazenar os resultados recentes e evitar chamadas duplicadas
const cache = new Map();
const CACHE_TTL = 60000; // 1 minuto

// Interface para representar erros da API
interface ApiError {
  status?: number;
  code?: string;
  message?: string;
}

// Cria um cliente com throttling para evitar erros de rate limit
export const createClient = () => {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Substitui os métodos auth para incluir cache e throttling
  const originalAuth = client.auth;
  
  // Função throttle para getUser - limita a 1 chamada por segundo
  const throttledGetUser = throttle(originalAuth.getUser.bind(originalAuth), 1000);
  
  client.auth.getUser = async () => {
    const cacheKey = 'getUser';
    const now = Date.now();
    
    // Verificar cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_TTL) {
        return cached.result;
      }
    }
    
    try {
      const result = await throttledGetUser();
      // Armazenar no cache
      cache.set(cacheKey, { result, timestamp: now });
      return result;
    } catch (error) {
      // Se for erro de rate limit, retornar um resultado padrão
      const apiError = error as ApiError;
      if (apiError?.status === 429) {
        console.warn('Rate limit atingido, usando cache ou retorno padrão');
        
        // Se tiver cache, use mesmo expirado
        if (cache.has(cacheKey)) {
          return cache.get(cacheKey).result;
        }
        
        // Retorno padrão se não tiver cache
        return { data: { user: null }, error: null };
      }
      throw error;
    }
  };

  // Throttle getSession de forma similar
  const throttledGetSession = throttle(originalAuth.getSession.bind(originalAuth), 1000);
  
  client.auth.getSession = async () => {
    const cacheKey = 'getSession';
    const now = Date.now();
    
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_TTL) {
        return cached.result;
      }
    }
    
    try {
      const result = await throttledGetSession();
      cache.set(cacheKey, { result, timestamp: now });
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.status === 429) {
        console.warn('Rate limit atingido, usando cache ou retorno padrão');
        
        if (cache.has(cacheKey)) {
          return cache.get(cacheKey).result;
        }
        
        return { data: { session: null }, error: null };
      }
      throw error;
    }
  };

  return client;
};
