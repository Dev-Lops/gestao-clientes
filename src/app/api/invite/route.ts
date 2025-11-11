import { NextResponse } from "next/server";
import { getSessionProfile } from "@/services/auth/session";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getSessionProfile();
  if (!session.user)
    return NextResponse.json(
      { ok: false, message: "unauthorized" },
      { status: 401 },
    );
  if (!session.orgId)
    return NextResponse.json({ ok: false, message: "no org" }, { status: 400 });

  const body = await req.json();
  const { email, role, client_id } = body as {
    email: string;
    role: "staff" | "client";
    client_id?: string;
  };

  const token = crypto.randomBytes(16).toString("hex");

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("app_invitations").insert([
    {
      org_id: session.orgId,
      client_id: client_id ?? null,
      email,
      role,
      token,
      created_by: session.user.id,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
  ]);

  if (error) {
    console.error(error);
    return NextResponse.json(
      { ok: false, message: "erro ao criar convite" },
      { status: 500 },
    );
  }

  // aqui você mandaria o e-mail
  return NextResponse.json({ ok: true, token });
}
