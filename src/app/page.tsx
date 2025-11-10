<<<<<<< HEAD
// src/app/page.tsx
=======

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  return redirect(user ? "/dashboard" : "/auth/login");
}
