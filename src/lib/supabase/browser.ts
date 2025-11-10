import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/env";

let browserClient: SupabaseClient | null = null;

function getSupabaseCredentials() {
  return {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
  } as const;
}

export function createSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) {
    return browserClient;
  }

  const { url, anonKey } = getSupabaseCredentials();
  browserClient = createBrowserClient(url, anonKey);
  return browserClient;
}
