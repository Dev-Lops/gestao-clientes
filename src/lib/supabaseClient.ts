import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

let browserClient: SupabaseClient | null = null;

function getSupabaseCredentials() {
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseCredentials();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        void name;
        void value;
        void options;
        // cookies() em renderizações server-side padrão é somente leitura.
        // A atualização real deve ocorrer via Route Handler usando createRouteHandlerClient.
      },
      remove(name: string, options: CookieOptions) {
        void name;
        void options;
        // Não faz nada aqui pelo mesmo motivo do método set.
      },
    },
  });
}

export function createSupabaseRouteHandlerClient(
  cookieStore: CookieStore,
  response: NextResponse
) {
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

export function createSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseCredentials();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}

// Backwards compatibility with previous helper names
export const createServerSupabaseClient = createSupabaseServerClient;
export const createRouteHandlerClient = createSupabaseRouteHandlerClient;
