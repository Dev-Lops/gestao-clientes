import type { AppClient, OrgClientStats } from "@/types/tables";

export function deriveOrgClientStats(
  orgId: string,
  clients: AppClient[],
): OrgClientStats {
  const total = clients.length;
  const countByStatus = (status: string) =>
    clients.filter((client) => client.status === status).length;

  const progressValues = clients
    .map((client) =>
      typeof client.progress === "number" && Number.isFinite(client.progress)
        ? client.progress
        : null,
    )
    .filter((value): value is number => value !== null);

  const averageProgress =
    progressValues.length > 0
      ? Number(
          (
            progressValues.reduce((sum, value) => sum + value, 0) /
            progressValues.length
          ).toFixed(2),
        )
      : null;

  return {
    id: orgId,
    org_id: orgId,
    total,
    ativos: countByStatus("active"),
    onboarding: countByStatus("onboarding"),
    pausados: countByStatus("paused"),
    media_progresso: averageProgress,
  };
}
