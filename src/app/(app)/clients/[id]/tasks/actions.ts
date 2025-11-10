"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";

type TaskStatus = "todo" | "doing" | "done" | "blocked";
type TaskUrgency = "low" | "medium" | "high" | "critical";

const DEFAULT_STATUS: TaskStatus = "todo";

function parseStatus(value: string | null): TaskStatus {
  switch (value) {
    case "doing":
    case "done":
    case "blocked":
      return value;
    default:
      return DEFAULT_STATUS;
  }
}

function parseUrgency(value: string | null): TaskUrgency {
  switch (value) {
    case "medium":
    case "high":
    case "critical":
      return value;
    default:
      return "low";
  }
}

export async function createTask(formData: FormData): Promise<void> {
  const clientId = String(formData.get("clientId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("due_date") ?? "").trim();
  const urgency = parseUrgency(String(formData.get("urgency")) ?? null);

  if (!clientId || !title) {
    throw new Error("Informe o cliente e o título da tarefa.");
  }

  const session = await getSessionProfile();
  if (!session.user || !session.orgId) {
    throw new Error("Usuário não autenticado ou organização não encontrada.");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("app_tasks").insert({
    org_id: session.orgId,
    client_id: clientId,
    title,
    due_date: dueDate || null,
    urgency,
    status: DEFAULT_STATUS,
  });

  if (error) {
    console.error("Erro ao criar tarefa:", error.message);
    throw new Error("Não foi possível criar a tarefa.");
  }

  revalidatePath(`/clients/${clientId}/tasks`);
}

export async function toggleTask(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();
  const status = parseStatus(String(formData.get("status")) ?? null);

  if (!id || !clientId) {
    throw new Error("Dados inválidos para atualização.");
  }

  const session = await getSessionProfile();
  if (!session.user || !session.orgId) {
    throw new Error("Usuário não autenticado ou organização não encontrada.");
  }

  const nextStatus: TaskStatus = status === "done" ? DEFAULT_STATUS : "done";

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("app_tasks")
    .update({
      status: nextStatus,
    })
    .eq("id", id)
    .eq("org_id", session.orgId);

  if (error) {
    console.error("Erro ao atualizar tarefa:", error.message);
    throw new Error("Erro ao atualizar a tarefa.");
  }

  revalidatePath(`/clients/${clientId}/tasks`);
}

export async function deleteTask(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();

  if (!id || !clientId) {
    throw new Error("Dados inválidos para exclusão.");
  }

  const session = await getSessionProfile();
  if (!session.user || !session.orgId) {
    throw new Error("Usuário não autenticado ou organização não encontrada.");
  }

  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("app_tasks")
    .delete()
    .eq("id", id)
    .eq("org_id", session.orgId);

  if (error) {
    console.error("Erro ao excluir tarefa:", error.message);
    throw new Error("Erro ao excluir tarefa.");
  }

  revalidatePath(`/clients/${clientId}/tasks`);
}
