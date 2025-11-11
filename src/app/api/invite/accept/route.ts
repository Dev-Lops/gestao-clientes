import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

// aqui assumo que o usuário já está logado no Supabase
export async function POST(req: Request) {
  const body = await req.json();
  const { token, user_id } = body as { token: string; user_id: string };

  const supabase = createSupabaseServiceRoleClient();

  const { data: invite, error: inviteErr } = await supabase
    .from("app_invitations")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (inviteErr || !invite) {
    return NextResponse.json(
      { ok: false, message: "convite inválido" },
      { status: 400 },
    );
  }

  // cria membro
  const { error: memberErr } = await supabase.from("app_members").insert([
    {
      org_id: invite.org_id,
      user_id,
      role: invite.role,
      status: "active",
      email: invite.email,
    },
  ]);

  if (memberErr) {
    console.error(memberErr);
    return NextResponse.json(
      { ok: false, message: "erro ao aceitar convite" },
      { status: 500 },
    );
  }

  // opcional: se for cliente convidado para 1 cliente específico
  if (invite.client_id && invite.role === "client") {
    await supabase.from("app_client_access").insert([
      {
        org_id: invite.org_id,
        client_id: invite.client_id,
        user_id,
        role: "client",
      },
    ]);
  }

  // marca convite como aceito
  await supabase
    .from("app_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return NextResponse.json({ ok: true });
}
