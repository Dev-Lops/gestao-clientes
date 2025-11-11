"use server";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";

const DEFAULT_ORG_NAME = "Minha Organização";

export async function createOrganizationAction(name: string) {
  const { user, orgId } = await getSessionProfile();

  if (!user) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (orgId) {
    return { success: true, orgId } as const;
  }

  const supabase = createSupabaseServiceRoleClient();

  const trimmedName = name.trim() || DEFAULT_ORG_NAME;

  const { data: org, error: orgError } = await supabase
    .from("app_orgs")
    .insert({
      name: trimmedName,
      owner_user_id: user.id,
    })
    .select("id")
    .single();

  if (orgError || !org) {
    throw new Error("Não foi possível criar a organização.");
  }

  const { error: memberError } = await supabase.from("app_members").insert({
    org_id: org.id,
    user_id: user.id,
    role: "owner",
    status: "active",
  });

  if (memberError) {
    throw new Error("Não foi possível vincular o usuário à organização.");
  }

  return { success: true, orgId: org.id } as const;
}
