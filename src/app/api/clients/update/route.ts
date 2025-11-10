import { createSupabaseServerClient } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await req.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Sessão expirada. Faça login novamente." },
        { status: 401 }
      );
    }

    if (!body.id) {
      return NextResponse.json(
        { message: "ID do cliente não informado." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("app_clients")
      .update({
        name: body.name,
        status: body.status,
        plan: body.plan,
        main_channel: body.main_channel,
        account_manager: body.account_manager,
        payment_status: body.payment_status,
        payment_method: body.payment_method,
        billing_day: body.billing_day,
        monthly_ticket: body.monthly_ticket,
        internal_notes: body.internal_notes,
        meeting_date: body.meeting_date,
        payment_date: body.payment_date,
        progress: body.progress,
      })
      .eq("id", body.id)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("❌ Erro ao atualizar cliente:", error.message);
      return NextResponse.json(
        { message: `Erro ao atualizar cliente: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Erro inesperado:", err);
    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}
