"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { can } from "@/services/auth/rbac";
import { getSessionProfile } from "@/services/auth/session";
import { createClientRecord } from "@/services/repositories/clients";

export async function createClientAction(formData: FormData): Promise<void> {
  const session = await getSessionProfile();

  if (!session.user) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!session.orgId) {
    throw new Error("Não foi possível identificar a organização do usuário.");
  }

  if (!can(session.role as "client" | "staff" | "owner", "staff")) {
    throw new Error("Permissão insuficiente para criar clientes.");
  }

  const getValue = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  const parsed = {
    name: getValue("name"),
    plan: getValue("plan") || "Gestão",
    main_channel: getValue("main_channel") || "Instagram",
    start_date: getValue("start_date"),
    account_manager: getValue("account_manager"),
    monthly_ticket: getValue("monthly_ticket"),
    billing_day: getValue("billing_day"),
    payment_method: getValue("payment_method"),
    payment_status: getValue("payment_status"),
    last_meeting_at: getValue("last_meeting_at"),
    next_delivery: getValue("next_delivery"),
    progress: getValue("progress"),
    internal_notes: getValue("internal_notes"),
  };

  if (parsed.name.trim().length < 3) {
    throw new Error("Informe um nome válido para o cliente.");
  }

  const normalizeString = (value?: string) =>
    value && value.trim().length > 0 ? value.trim() : null;

  const toNumber = (value?: string) => {
    if (!value || value.trim() === "") return null;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
  };

  const client = await createClientRecord({
    orgId: session.orgId,
    createdBy: session.user.id,
    name: parsed.name,
    plan: parsed.plan,
    mainChannel: parsed.main_channel,
    accountManager: normalizeString(parsed.account_manager),
    paymentStatus: normalizeString(parsed.payment_status),
    paymentMethod: normalizeString(parsed.payment_method),
    monthlyTicket: toNumber(parsed.monthly_ticket),
    billingDay: toNumber(parsed.billing_day),
    startDate: normalizeString(parsed.start_date),
    nextDelivery: normalizeString(parsed.next_delivery),
    lastMeetingAt: normalizeString(parsed.last_meeting_at),
    progress: toNumber(parsed.progress),
    internalNotes: normalizeString(parsed.internal_notes),
  });

  revalidatePath("/clients");
  redirect(`/clients/${client.id}/info`);
}
