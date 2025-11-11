import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} from "@/config/env";

export type SupabaseServerClient = SupabaseClient<Database>;
export type SupabaseServiceRoleClient = SupabaseClient<Database>;

function assertEnv() {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL não configurado");
  if (!SUPABASE_ANON_KEY) throw new Error("SUPABASE_ANON_KEY não configurado");
}

// ⚠ para SSR / server components
export async function createSupabaseServerClient(): Promise<SupabaseServerClient> {
  assertEnv();
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      // não vamos setar cookies aqui
      setAll: () => {},
    },
  });
}

// ⚠ para server actions / route handlers com service role
export function createSupabaseServiceRoleClient(): SupabaseServiceRoleClient {
  assertEnv();
  if (!SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
