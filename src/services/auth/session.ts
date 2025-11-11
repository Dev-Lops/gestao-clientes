"use server";

import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  resolveSessionContext,
  type SessionMemberSnapshot,
} from "./session-utils";
import type { AppRole } from "./rbac";

export type SessionProfile = {
  user: User | null;
  role: AppRole | null;
  orgId: string | null;
};

export async function getSessionProfile(): Promise<SessionProfile> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, role: null, orgId: null } as const;
  }

  const { data: member } = await supabase
    .from("app_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle<SessionMemberSnapshot>();

  let ownerOrgId: string | null = null;

  if (!member?.org_id) {
    const { data: ownerOrg } = await supabase
      .from("app_orgs")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    ownerOrgId = ownerOrg?.id ?? null;
  }

  const { orgId, role } = resolveSessionContext(member ?? null, ownerOrgId);

  return {
    user,
    role,
    orgId,
  } as const;
}
