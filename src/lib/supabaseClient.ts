import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

type ServerClient = SupabaseClient;

function getSupabaseCredentials() {
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  } as const;
}

export async function createSupabaseServerClient(): Promise<ServerClient> {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseCredentials();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // cookies() em renderizações server-side padrão é somente leitura.
      },
      remove() {
        // cookies() em renderizações server-side padrão é somente leitura.
      },
    },
  });
}

export function createSupabaseRouteHandlerClient(
  cookieStore: CookieStore,
  response: NextResponse
): ServerClient {
  const { url, anonKey } = getSupabaseCredentials();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}

export type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

// Backwards compatibility exports for legacy imports
export const createServerSupabaseClient = createSupabaseServerClient;
export const createRouteHandlerClient = createSupabaseRouteHandlerClient;
