"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/env";
import type { Database } from "@/types/supabase";

let browserClient: SupabaseClient<Database> | null = null;

function assertCredentials() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Configuração do Supabase ausente no ambiente público.");
  }
}

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  assertCredentials();

  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookieOptions: { sameSite: "lax" },
    },
  );

  return browserClient;
}
