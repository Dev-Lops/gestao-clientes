import { createSupabaseServerClient } from "@/lib/supabaseClient";
import type { AppClient } from "@/types/tables";

export interface CreateClientInput {
  orgId: string;
  createdBy: string;
  name: string;
  status?: AppClient["status"];
  plan?: string | null;
  mainChannel?: string | null;
  accountManager?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  monthlyTicket?: number | null;
  billingDay?: number | null;
  startDate?: string | null;
  nextDelivery?: string | null;
  lastMeetingAt?: string | null;
  progress?: number | null;
  internalNotes?: string | null;
}

export async function listClientsByOrg(orgId: string): Promise<AppClient[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_clients")
    .select(
      "id, name, status, plan, main_channel, created_at, payment_status, monthly_ticket, account_manager"
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Erro ao buscar clientes: ${error.message}`);
  }

  return (data ?? []) as AppClient[];
}

export async function createClientRecord(input: CreateClientInput) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_clients")
    .insert({
      org_id: input.orgId,
      created_by: input.createdBy,
      name: input.name,
      status: input.status ?? "new",
      plan: input.plan,
      main_channel: input.mainChannel,
      account_manager: input.accountManager,
      payment_status: input.paymentStatus,
      payment_method: input.paymentMethod,
      monthly_ticket: input.monthlyTicket,
      billing_day: input.billingDay,
      start_date: input.startDate,
      next_delivery: input.nextDelivery,
      last_meeting_at: input.lastMeetingAt,
      progress: input.progress,
      internal_notes: input.internalNotes,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Erro ao criar cliente: ${error.message}`);
  }

  return data as AppClient;
}

export async function deleteClientById(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("app_clients").delete().eq("id", clientId);

  if (error) {
    throw new Error(`Erro ao excluir cliente: ${error.message}`);
  }
}

export async function removeClientAccess(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: client, error } = await supabase
    .from("app_clients")
    .select("id, member_id")
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao consultar cliente: ${error.message}`);
  }

  if (!client) {
    throw new Error("Cliente não encontrado");
  }

  if (client.member_id) {
    const { error: memberError } = await supabase
      .from("app_members")
      .delete()
      .eq("id", client.member_id);

    if (memberError) {
      throw new Error(`Erro ao remover membro: ${memberError.message}`);
    }
  }

  const { error: updateError } = await supabase
    .from("app_clients")
    .update({ invited_email: null, member_id: null })
    .eq("id", clientId);

  if (updateError) {
    throw new Error(`Erro ao limpar convite: ${updateError.message}`);
  }
}

export async function updateClientById(
  clientId: string,
  payload: Partial<Pick<AppClient, "name" | "status" | "plan" | "main_channel" | "account_manager">>
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("app_clients").update(payload).eq("id", clientId);

  if (error) {
    throw new Error(`Erro ao atualizar cliente: ${error.message}`);
  }
}

export async function getClientById(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_clients")
    .select("*")
    .eq("id", clientId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar cliente: ${error.message}`);
  }

  return data as AppClient | null;
}
