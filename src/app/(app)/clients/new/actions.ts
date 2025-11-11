"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { isOwner, isStaffOrAbove } from "@/services/auth/rbac";
import { getSessionProfile } from "@/services/auth/session";
import type { AppClient } from "@/types/tables";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function normalizeDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(normalized.getTime())) {
    return null;
  }

  return normalized.toISOString().slice(0, 10);
}

export async function createClientAction(formData: FormData) {
  const { user, orgId, role } = await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  if (!orgId) {
    throw new Error("Organização não encontrada para o usuário atual.");
  }

  if (!(isOwner(role) || isStaffOrAbove(role))) {
    throw new Error("Você não tem permissão para criar clientes.");
  }

  const getString = (key: string) =>
    formData.get(key)?.toString().trim() || null;
  const getNumber = (key: string) =>
    formData.get(key) ? Number(formData.get(key)) : null;

  const name = getString("name");
  if (!name) {
    throw new Error("Nome do cliente é obrigatório.");
  }

  const payload = {
    org_id: orgId,
    created_by: user.id,
    name,
    plan: getString("plan"),
    main_channel: getString("main_channel"),
    start_date: normalizeDate(getString("start_date")),
    account_manager: getString("account_manager"),
    last_meeting_at: normalizeDate(getString("last_meeting_at")),
    next_delivery: normalizeDate(getString("next_delivery")),
    progress: getNumber("progress") ?? 0,
    internal_notes: getString("internal_notes"),
    monthly_ticket: getNumber("monthly_ticket"),
    billing_day: getNumber("billing_day"),
    payment_method: getString("payment_method"),
    payment_status: getString("payment_status"),
    status: "new",
  };

  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("app_clients")
    .insert([payload])
    .select()
    .single<AppClient>();

  if (error || !data) {
    throw new Error("Não foi possível criar o cliente. Tente novamente.");
  }

  revalidatePath("/clients");
  redirect(`/clients/${data.id}/info`);
}
