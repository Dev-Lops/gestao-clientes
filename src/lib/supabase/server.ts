import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/supabase";
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} from "@/config/env";

export type SupabaseServerClient = SupabaseClient<Database>;
export type SupabaseServiceRoleClient = SupabaseClient<Database>;

function assertSupabaseUrl() {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL não configurado.");
  if (!SUPABASE_ANON_KEY) throw new Error("SUPABASE_ANON_KEY não configurado.");
}

export async function createSupabaseServerClient(): Promise<SupabaseServerClient> {
  assertSupabaseUrl();
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set() {},
      remove() {},
    },
  });
}

export async function createSupabaseRouteHandlerClient(
  response: NextResponse,
): Promise<SupabaseServerClient> {
  assertSupabaseUrl();
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) =>
        response.cookies.set({ name, value, ...options }),
      remove: (name: string, options: CookieOptions) =>
        response.cookies.set({ name, value: "", ...options, maxAge: 0 }),
    },
  });
}

export function createSupabaseServiceRoleClient(): SupabaseServiceRoleClient {
  assertSupabaseUrl();
  if (!SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado.");

  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
