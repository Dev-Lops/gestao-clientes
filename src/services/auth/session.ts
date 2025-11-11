import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionProfile = {
  user: { id: string; email?: string | null } | null;
  orgId: string | null;
  role: "owner" | "staff" | "client" | null;
};

export async function getSessionProfile(): Promise<SessionProfile> {
  const supabase = createSupabaseServerClient();

  // 1. user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, orgId: null, role: null };

  // 2. tenta pegar org e role da tabela de membros
  const { data: member } = await supabase
    .from("app_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (member) {
    return {
      user: { id: user.id, email: user.email },
      orgId: member.org_id,
      role: member.role as "owner" | "staff" | "client",
    };
  }

  // 3. fallback: pode ser owner direto da org
  const { data: org } = await supabase
    .from("app_orgs")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (org) {
    return {
      user: { id: user.id, email: user.email },
      orgId: org.id,
      role: "owner",
    };
  }

  // 4. sem org
  return {
    user: { id: user.id, email: user.email },
    orgId: null,
    role: null,
  };
}
