export const CLIENT_STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  onboarding: "Em Onboarding",
  active: "Ativo",
  paused: "Pausado",
  closed: "Encerrado",
};

export function getStatusLabel(status?: string | null): string {
  if (!status) return "Novo";
  return CLIENT_STATUS_LABELS[status] ?? status;
}
