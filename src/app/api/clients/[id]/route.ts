import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";
import { NextResponse } from "next/server";

const CLIENT_DETAILS =
  "id, org_id, name, status, plan, main_channel, account_manager, payment_status, payment_method, billing_day, monthly_ticket, start_date, next_delivery, last_meeting_at, progress, internal_notes";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSessionProfile();

  if (!session.user || !session.orgId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_clients")
    .select(CLIENT_DETAILS)
    .eq("id", id)
    .eq("org_id", session.orgId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { error: "Cliente não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json(data, { status: 200 });
}
