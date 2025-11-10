import { createSupabaseServerClient } from "@/lib/supabase/server";
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

<<<<<<< HEAD
export async function deleteClientById(params: { orgId: string; clientId: string }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_clients")
    .delete()
    .eq("id", params.clientId)
    .eq("org_id", params.orgId)
    .select("id")
    .maybeSingle();
=======
export async function deleteClientById(clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("app_clients").delete().eq("id", clientId);
>>>>>>> main

  if (error) {
    throw new Error(`Erro ao excluir cliente: ${error.message}`);
  }
<<<<<<< HEAD

  if (!data) {
    throw new Error("Cliente não encontrado na organização informada.");
  }
}

export async function removeClientAccess(params: { orgId: string; clientId: string }) {
=======
}

export async function removeClientAccess(clientId: string) {
>>>>>>> main
  const supabase = await createSupabaseServerClient();
  const { data: client, error } = await supabase
    .from("app_clients")
    .select("id, member_id")
<<<<<<< HEAD
    .eq("id", params.clientId)
    .eq("org_id", params.orgId)
=======
    .eq("id", clientId)
>>>>>>> main
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
<<<<<<< HEAD
      .eq("id", client.member_id)
      .eq("org_id", params.orgId);
=======
      .eq("id", client.member_id);
>>>>>>> main

    if (memberError) {
      throw new Error(`Erro ao remover membro: ${memberError.message}`);
    }
  }

  const { error: updateError } = await supabase
    .from("app_clients")
    .update({ invited_email: null, member_id: null })
<<<<<<< HEAD
    .eq("id", params.clientId)
    .eq("org_id", params.orgId);
=======
    .eq("id", clientId);
>>>>>>> main

  if (updateError) {
    throw new Error(`Erro ao limpar convite: ${updateError.message}`);
  }
}

export async function updateClientById(
<<<<<<< HEAD
  orgId: string,
=======
>>>>>>> main
  clientId: string,
  payload: Partial<Pick<AppClient, "name" | "status" | "plan" | "main_channel" | "account_manager">>
) {
  const supabase = await createSupabaseServerClient();
<<<<<<< HEAD
  const { error } = await supabase
    .from("app_clients")
    .update(payload)
    .eq("id", clientId)
    .eq("org_id", orgId);
=======
  const { error } = await supabase.from("app_clients").update(payload).eq("id", clientId);
>>>>>>> main

  if (error) {
    throw new Error(`Erro ao atualizar cliente: ${error.message}`);
  }
}

<<<<<<< HEAD
export async function getClientById(orgId: string, clientId: string) {
=======
export async function getClientById(clientId: string) {
>>>>>>> main
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_clients")
    .select("*")
    .eq("id", clientId)
<<<<<<< HEAD
    .eq("org_id", orgId)
=======
>>>>>>> main
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar cliente: ${error.message}`);
  }

  return data as AppClient | null;
}
