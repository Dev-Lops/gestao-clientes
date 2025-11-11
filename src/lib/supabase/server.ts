import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "@/config/env";
import type { Database } from "@/types/supabase";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import "server-only";

export type SupabaseServerClient = SupabaseClient<Database>;
export type SupabaseServiceRoleClient = SupabaseClient<Database>;

function assertSupabaseEnv() {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL não configurado.");
  }

  if (!SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_ANON_KEY não configurado.");
  }
}

export async function createSupabaseServerClient(): Promise<SupabaseServerClient> {
  assertSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {
        /**
         * Server Components não devem ajustar cookies.
         * Esta função é propositalmente vazia para evitar efeitos colaterais.
         */
      },
    },
  });
}

export async function createSupabaseRouteHandlerClient(
  response: NextResponse,
): Promise<SupabaseServerClient> {
  assertSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set({ name, value, ...options });
        }
      },
    },
  });
}

export function createSupabaseServiceRoleClient(): SupabaseServiceRoleClient {
  assertSupabaseEnv();

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado.");
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
