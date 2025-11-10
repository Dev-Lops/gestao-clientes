import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const { user, orgId } = await getSessionProfile();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json({ error: "Missing organization ID" }, { status: 400 });
      return NextResponse.json({ error: "Missing organization ID" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("app_clients")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();
      .from("app_clients")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client: data }, { status: 200 });
    return NextResponse.json({ client: data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("API Error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
      console.error("API Error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
