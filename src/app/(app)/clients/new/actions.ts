"use server";

import { getSessionProfile } from "@/services/auth/session";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { can } from "@/services/auth/rbac";

export async function createClientAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim();
  const plan = (formData.get("plan") as string) || null;
  const main_channel = (formData.get("main_channel") as string) || null;
  const billing_day_raw = formData.get("billing_day") as string | null;
  const billing_day =
    billing_day_raw && billing_day_raw !== "" ? Number(billing_day_raw) : null;

  const start_date = (formData.get("start_date") as string) || null;
  const account_manager = (formData.get("account_manager") as string) || null;
  const last_meeting_at = (formData.get("last_meeting_at") as string) || null;
  const next_delivery = (formData.get("next_delivery") as string) || null;
  const progress_raw = formData.get("progress") as string | null;
  const progress =
    progress_raw && progress_raw !== "" ? Number(progress_raw) : 0;
  const internal_notes = (formData.get("internal_notes") as string) || null;
  const monthly_ticket_raw = formData.get("monthly_ticket") as string | null;
  const monthly_ticket =
    monthly_ticket_raw && monthly_ticket_raw !== ""
      ? Number(monthly_ticket_raw)
      : null;
  const payment_method = (formData.get("payment_method") as string) || null;
  const payment_status = (formData.get("payment_status") as string) || null;

  if (!name) throw new Error("Nome do cliente é obrigatório.");

  const session = await getSessionProfile();
  if (!session.user) redirect("/login");
  if (!session.orgId) throw new Error("Usuário sem organização vinculada.");
  if (!can(session.role, "staff"))
    throw new Error("Você não tem permissão para criar clientes.");

  const supabaseAdmin = createSupabaseServiceRoleClient();

  const { data, error } = await supabaseAdmin
    .from("app_clients")
    .insert([
      {
        org_id: session.orgId,
        created_by: session.user.id,
        name,
        plan,
        main_channel,
        billing_day,
        status: "new",
        progress,
        account_manager,
        payment_status,
        payment_method,
        start_date,
        last_meeting_at,
        next_delivery,
        monthly_ticket,
        internal_notes,
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("Supabase erro ao criar cliente:", error);
    throw new Error("Erro ao criar cliente.");
  }

  revalidatePath("/clients");
  redirect(`/clients/${data.id}/info`);
}
