import { SidebarWithTopbar } from "@/components/shared/layout/SidebarWithTopbar";
import RealtimeWrapper from "@/components/shared/RealtimeWrapper";
import { getSessionProfile } from "@/services/auth/session";
import type { Role } from "@/services/auth/rbac";
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
  const allowedRoles: Role[] = ["owner", "staff", "client"];
  const fallbackRole: Role = "client";
  const effectiveRole: Role =
    role && allowedRoles.includes(role as Role) ? (role as Role) : fallbackRole;

  const displayName = user.email ?? "Usuário";

  return (
    <RealtimeWrapper orgId={orgId}>
      <SidebarWithTopbar role={effectiveRole} userName={displayName}>
        {children}
      </SidebarWithTopbar>
    </RealtimeWrapper>
  );
}
