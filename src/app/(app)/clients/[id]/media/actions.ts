"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { isOwner } from "@/services/auth/rbac";
import { getSessionProfile } from "@/services/auth/session";

export async function deleteMediaItem(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const clientId = String(formData.get("clientId") ?? "").trim();

  if (!id || !clientId) {
    throw new Error("Arquivo inválido para exclusão.");
  }

  const { user, role, orgId } = await getSessionProfile();

  if (!user) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!orgId) {
    throw new Error("Organização não encontrada.");
  }

  if (!isOwner(role)) {
    throw new Error("Apenas proprietários podem excluir arquivos.");
  }

  const serviceClient = createSupabaseServiceRoleClient();

  const { data: mediaItem, error: fetchError } = await serviceClient
    .from("app_media_items")
    .select("id, org_id, client_id, file_path")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (
    !mediaItem ||
    mediaItem.org_id !== orgId ||
    mediaItem.client_id !== clientId
  ) {
    throw new Error("Arquivo não pertence a esta organização.");
  }

  if (mediaItem.file_path) {
    const { error: storageError } = await serviceClient.storage
      .from("media")
      .remove([mediaItem.file_path]);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error: deleteError } = await serviceClient
    .from("app_media_items")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  revalidatePath(`/clients/${clientId}/media`);
}
