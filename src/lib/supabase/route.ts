import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/config/env";
import type { Database } from "@/types/supabase";

export type SupabaseRouteHandlerClient = SupabaseClient<Database>;

function assertEnv() {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL não configurado");
  if (!SUPABASE_ANON_KEY) throw new Error("SUPABASE_ANON_KEY não configurado");
}

export async function createSupabaseRouteHandlerClient(
  response: NextResponse,
): Promise<SupabaseRouteHandlerClient> {
  assertEnv();
  const cookieStore = cookies();

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
