// src/services/auth/ability/server.ts
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";
import { defineAbilityFor } from "./defineAbility";
import type { AppActions, AppSubjects, AppAbility } from "./types";

export async function getServerAbility() {
  const session = await getSessionProfile();
  const supabase = await createSupabaseServerClient();

  // buscar clientes que esse usuário (se for client) pode ver
  let accessibleClientIds: string[] = [];

  if (session.user && session.role === "client") {
    const { data } = await supabase
      .from("app_client_access")
      .select("client_id")
      .eq("user_id", session.user.id);

    accessibleClientIds = (data ?? []).map((row) => row.client_id);
  }

  const ability = defineAbilityFor({
    role: session.role,
    orgId: session.orgId,
    accessibleClientIds,
  });

  return ability;
}

/**
 * helper para server actions:
 * lança erro se não puder
 */
export async function requireAbility(
  action: Parameters<typeof abilityCan>[1],
  subject: Parameters<typeof abilityCan>[2],
  resource?: Record<string, unknown>,
) {
  const ability = await getServerAbility();
  const ok = abilityCan(ability, action, subject, resource);
  if (!ok) {
    throw new Error("Permissão insuficiente");
  }
  return ability;
}

/**
 * checa passando objeto (quando você tem o registro completo)
 */
export function abilityCan(
  ability: AppAbility,
  action: AppActions,
  subject: AppSubjects,
  resource?: Record<string, unknown>,
) {
  // se tiver o objeto (ex: client do supabase), passa o objeto
  if (resource) {
    return ability.can(action, subject, resource);
  }
  return ability.can(action, subject);
}
