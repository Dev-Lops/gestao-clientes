import {
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
} from "@/config/env";
import type { Database } from "@/types/supabase";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import "server-only";

export type SupabaseServerClient = SupabaseClient<Database>;
export type SupabaseServiceRoleClient = SupabaseClient<Database>;

function assertSupabaseUrl() {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL não configurado.");
  if (!SUPABASE_ANON_KEY) throw new Error("SUPABASE_ANON_KEY não configurado.");
}

/**
 * Cria o client Supabase para Server Components.
 * cookies() é síncrono aqui e já tratado pelo SDK.
 */
export function createSupabaseServerClient(): SupabaseServerClient {
  assertSupabaseUrl();

  const cookieStore = cookies(); // sem await

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: () => {
        // cookies() é somente leitura em Server Components
      },
      remove: () => {
        // cookies() é somente leitura em Server Components
      },
    },
  });
}

/**
 * Cria o client Supabase para rotas API / route handlers
 */
export function createSupabaseRouteHandlerClient(
  response: NextResponse,
): SupabaseServerClient {
  assertSupabaseUrl();

  const cookieStore = cookies(); // sem await

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        response.cookies.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}

/**
 * Client com Service Role — nunca usar no client/browser
 */
export function createSupabaseServiceRoleClient(): SupabaseServiceRoleClient {
  assertSupabaseUrl();
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado.");
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const createServerSupabaseClient = createSupabaseServerClient;
export const createRouteHandlerClient = createSupabaseRouteHandlerClient;
