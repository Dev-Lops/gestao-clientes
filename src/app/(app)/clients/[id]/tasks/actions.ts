"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { can, isOwner } from "@/services/auth/rbac";
import { getSessionProfile } from "@/services/auth/session";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const title = formData.get("title") as string;
  const due_date = formData.get("due_date") as string | null;
  const urgency = formData.get("urgency") as string | null;
  const clientId = formData.get("clientId") as string;

  if (!title?.trim()) return;

  const { user, orgId, role } = await getSessionProfile();
  if (!user || !orgId) return;
  if (!(isOwner(role) || can(role, "staff"))) return;

  const supabase = await createSupabaseServerClient();

  const adjustedDate = due_date
    ? new Date(`${due_date}T12:00:00Z`).toISOString()
    : null;

  const { error } = await supabase.from("app_tasks").insert({
    title: title.trim(),
    client_id: clientId,
    org_id: orgId,
    created_by: user.id,
    due_date: adjustedDate,
    urgency: urgency || null,
    status: "todo",
  });
  if (error) return;

  revalidatePath(`/clients/${clientId}/tasks`);
}

export async function toggleTask(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const clientId = formData.get("clientId") as string;

  const { user, role } = await getSessionProfile();
  if (!user) return;
  if (!(isOwner(role) || can(role, "staff"))) return;

  const newStatus = status === "done" ? "todo" : "done";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("app_tasks")
    .update({ status: newStatus })
    .eq("id", id);
  if (error) return;

  revalidatePath(`/clients/${clientId}/tasks`);
}

export async function deleteTask(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();

  if (!id || !clientId) {
    throw new Error("Dados de exclusão inválidos.");
  }

  const { user, role, orgId } = await getSessionProfile();
  if (!user) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!orgId) {
    throw new Error("Organização não encontrada.");
  }

  if (!(isOwner(role) || can(role, "staff"))) {
    throw new Error("Você não tem permissão para excluir tarefas.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("app_tasks")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/clients/${clientId}/tasks`);
}
