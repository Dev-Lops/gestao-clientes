import { createSupabaseServerClient } from "@/lib/supabaseClient";
import { getSessionProfile } from "@/services/auth/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { user, orgId } = await getSessionProfile();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "Missing organization context" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("app_media_items")
      .select("id, folder, title, client_id, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar mídias:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Erro inesperado:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
