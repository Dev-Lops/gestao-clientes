import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const redirectUrl = new URL(
    "/login",
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  );

  const response = NextResponse.redirect(redirectUrl);
  const supabase = await createSupabaseRouteHandlerClient(response);

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("❌ Erro ao sair:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // remove session cookies manually since route handler client cannot mutate original store
  const sessionCookies = ["sb-access-token", "sb-refresh-token"];
  sessionCookies.forEach((name) => {
    response.cookies.set({ name, value: "", maxAge: 0, path: "/" });
  });

  return response;
}
