"use client";

import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
      <div className="flex flex-col gap-4 items-center bg-white/10 p-8 rounded-3xl shadow-lg">
        <h1 className="text-4xl font-bold mb-2">MyGest</h1>
        <p className="text-white/70 mb-4">
          Faça login com sua conta Google para acessar o painel.
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 bg-white text-slate-900 px-6 py-3 rounded-xl hover:bg-slate-100"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Conectando...
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" /> Entrar com Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}
