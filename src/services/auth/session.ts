"use server";

import { createServerSupabaseClient } from "@/lib/supabaseClient";

export async function getSessionProfile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, role: null, orgId: null } as const;
  }

  const { data: member, error: memberError } = await supabase
    .from("app_members")
    .select("id, org_id, role, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (memberError) {
    console.error("Erro ao buscar membro:", memberError);
  }

  let orgId = member?.org_id ?? null;

  if (!orgId) {
    const { data: ownerOrg, error: ownerError } = await supabase
      .from("app_orgs")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    if (ownerError) {
      console.error("Erro ao buscar organização do proprietário:", ownerError);
    }

    orgId = ownerOrg?.id ?? null;
  }

  return {
    user,
    role: member?.role ?? "owner",
    orgId,
  } as const;
}
