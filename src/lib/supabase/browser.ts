import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function createBrowserSupabaseClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase URL ou Anon Key ausentes nas variáveis de ambiente.");
  }

  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}

export function getSupabaseBrowser(): SupabaseClient {
  return createBrowserSupabaseClient();
}
