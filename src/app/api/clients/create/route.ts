import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";
import { ZodError, z } from "zod";

import type { AppClient } from "@/types/tables";
import { NextResponse } from "next/server";

const schema = z.object({
  name: z.string().min(3),
  status: z
    .enum(["new", "onboarding", "active", "paused", "closed"])
    .optional(),
  plan: z.string().nullable().optional(),
  main_channel: z.string().nullable().optional(),
  account_manager: z.string().nullable().optional(),
  payment_status: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  const session = await getSessionProfile();

  if (!session.user) {
    return NextResponse.json(
      { ok: false, message: "Usuário não autenticado." },
      { status: 401 },
    );
  }

  if (!session.orgId) {
    return NextResponse.json(
      { ok: false, message: "Organização não vinculada ao usuário." },
      { status: 400 },
    );
  }

  try {
    const payload = schema.parse(await req.json());
    const adminClient = createSupabaseServiceRoleClient();
    const status: AppClient["status"] = payload.status ?? "new";

    const { data, error } = await adminClient
      .from("app_clients")
      .insert({
        org_id: session.orgId,
        name: payload.name.trim(),
        status,
        plan: payload.plan ?? null,
        main_channel: payload.main_channel ?? null,
        account_manager: payload.account_manager ?? null,
        payment_status: payload.payment_status ?? null,
        payment_method: payload.payment_method ?? null,
        created_by: session.user.id,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: true, message: "Cliente criado com sucesso!", client: data },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { ok: false, message: "Dados inválidos", issues: error.issues },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ok: false, message: "Erro desconhecido ao criar cliente." },
      { status: 500 },
    );
  }
}
