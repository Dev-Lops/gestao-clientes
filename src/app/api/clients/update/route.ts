import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getSessionProfile();

    if (!session.user) {
      return NextResponse.json(
        { message: "Sessão expirada. Faça login novamente." },
        { status: 401 },
      );
    }

    if (!session.orgId) {
      return NextResponse.json(
        { message: "Organização não vinculada ao usuário." },
        { status: 403 },
      );
    }

    const payload = await req.json();

    if (!payload.id) {
      return NextResponse.json(
        { message: "ID do cliente não informado." },
        { status: 400 },
      );
    }

    const adminClient = createSupabaseServiceRoleClient();

    const { error } = await adminClient
      .from("app_clients")
      .update({
        name: payload.name,
        status: payload.status,
        plan: payload.plan,
        main_channel: payload.main_channel,
        account_manager: payload.account_manager,
        payment_status: payload.payment_status,
        payment_method: payload.payment_method,
        billing_day: payload.billing_day,
        monthly_ticket: payload.monthly_ticket,
        internal_notes: payload.internal_notes,
        meeting_date: payload.meeting_date,
        payment_date: payload.payment_date,
        progress: payload.progress,
      })
      .eq("id", payload.id)
      .eq("org_id", session.orgId)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { message: `Erro ao atualizar cliente: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Erro inesperado:", err);
    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 },
    );
  }
}
