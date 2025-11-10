"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type ReactNode } from "react";

<<<<<<< HEAD

=======
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2

interface SupabaseProviderProps {
  children: ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabase] = useState<SupabaseClient | null>(() => {
    try {
      return createBrowserSupabaseClient();
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const content = useMemo(() => children, [children]);

  if (!supabase) {
    return <>{content}</>;
  }

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={session}>
      {content}
    </SessionContextProvider>
  );
}
