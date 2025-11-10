import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";
import { NextRequest, NextResponse } from "next/server";

const CLIENT_DETAILS =
  "id, org_id, name, status, plan, main_channel, account_manager, payment_status, payment_method, billing_day, monthly_ticket, start_date, next_delivery, last_meeting_at, progress, internal_notes";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const { user, orgId } = await getSessionProfile();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Missing organization ID" },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("app_clients")
      .select(CLIENT_DETAILS)
      .eq("id", id)
      .eq("org_id", orgId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client: data }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("API Error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
