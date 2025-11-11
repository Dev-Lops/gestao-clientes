import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
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

const CLIENT_COLUMNS = `
  id, org_id, name, status, plan, main_channel, account_manager,
  payment_status, payment_method, billing_day, monthly_ticket,
  start_date, next_delivery, last_meeting_at, progress, internal_notes,
  created_at, created_by
`;

// 🔹 Lista clientes de uma organização
export async function listClientsByOrg(orgId: string): Promise<AppClient[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_clients")
    .select(CLIENT_COLUMNS)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(`Erro ao buscar clientes: ${error.message}`);
  return (data ?? []) as AppClient[];
}

// 🔹 Cria cliente (usado na server action)
export async function createClientRecord(input: CreateClientInput) {
  if (!input.orgId?.trim() || !input.createdBy?.trim()) {
    throw new Error("Organização e usuário são obrigatórios.");
  }
  if (!input.name?.trim()) {
    throw new Error("O nome do cliente é obrigatório.");
  }

  const supabase = createSupabaseServiceRoleClient();

  const payload = {
    org_id: input.orgId,
    created_by: input.createdBy,
    name: input.name.trim(),
    status: input.status ?? "new",
    plan: input.plan ?? null,
    main_channel: input.mainChannel ?? null,
    account_manager: input.accountManager ?? null,
    payment_status: input.paymentStatus ?? null,
    payment_method: input.paymentMethod ?? null,
    monthly_ticket: input.monthlyTicket ?? null,
    billing_day: input.billingDay ?? null,
    start_date: input.startDate ?? null,
    next_delivery: input.nextDelivery ?? null,
    last_meeting_at: input.lastMeetingAt ?? null,
    progress: input.progress ?? 0,
    internal_notes: input.internalNotes ?? null,
  };

  const { data, error } = await supabase
    .from("app_clients")
    .insert([payload])
    .select(CLIENT_COLUMNS)
    .single<AppClient>();

  if (error || !data) {
    throw new Error("Não foi possível criar o cliente no momento.");
  }

  return data;
}

// 🔹 Buscar 1 cliente da org
export async function getClientById(orgId: string, clientId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("app_clients")
    .select(CLIENT_COLUMNS)
    .eq("id", clientId)
    .eq("org_id", orgId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao carregar cliente: ${error.message}`);
  }

  return data as AppClient | null;
}

// 🔹 Atualizar cliente
export async function updateClientById(
  orgId: string,
  clientId: string,
  payload: Partial<
    Pick<
      AppClient,
      | "name"
      | "status"
      | "plan"
      | "main_channel"
      | "account_manager"
      | "payment_status"
      | "payment_method"
      | "billing_day"
      | "next_delivery"
      | "last_meeting_at"
      | "internal_notes"
      | "progress"
    >
  >,
) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("app_clients")
    .update(payload)
    .eq("id", clientId)
    .eq("org_id", orgId);

  if (error) {
    throw new Error("Não foi possível atualizar o cliente.");
  }
}

// 🔹 🚮 Remover cliente (com checagem de org)
export async function deleteClientById(params: {
  orgId: string;
  clientId: string;
}) {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("app_clients")
    .delete()
    .eq("id", params.clientId)
    .eq("org_id", params.orgId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível remover o cliente.");
  }

  if (!data) {
    // isso ajuda quando alguém tenta deletar um cliente de outra org
    throw new Error("Cliente não encontrado na organização informada.");
  }
}
