"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export default function LogoutButton() {
  const supabase = createBrowserSupabaseClient();
  const supabase = createBrowserSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
    >
      Sair
    </button>
  );
}
