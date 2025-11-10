import { SidebarWithTopbar } from "@/components/shared/layout/SidebarWithTopbar";
import RealtimeWrapper from "@/components/shared/RealtimeWrapper";
import { getSessionProfile } from "@/services/auth/session";
import type { AppRole } from "@/services/auth/rbac";
import { redirect } from "next/navigation";

/**
 * Layout principal do painel autenticado.
 * Executa no servidor (SSR) — NÃO pode conter código client-side.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔹 Carrega sessão atual (user, role, orgId)
  const { user, orgId, role } = await getSessionProfile();

  // 🔹 Se não estiver logado → login
  if (!user) redirect("/login");

  // 🔹 Se não tiver organização associada → setup
  if (!orgId) redirect("/setup");

  // 🔹 Roles válidos no painel
  const allowedRoles: AppRole[] = ["owner", "staff", "client"];
  const fallbackRole: AppRole = "client";
  const normalizedRole = role ?? fallbackRole;
  const effectiveRole: AppRole = allowedRoles.includes(normalizedRole)
    ? normalizedRole
    : fallbackRole;

  return (
    <RealtimeWrapper orgId={orgId}>
      <SidebarWithTopbar
        role={effectiveRole}
        userName={user.user_metadata?.full_name ?? user.email ?? "Usuário"}
      >
        {children}
      </SidebarWithTopbar>
    </RealtimeWrapper>
  );
}
