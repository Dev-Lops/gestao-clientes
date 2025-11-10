import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "@/types/client";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  onboarding: { label: "Onboarding", color: "bg-yellow-100 text-yellow-700" },
  active: { label: "Ativo", color: "bg-green-100 text-green-700" },
  paused: { label: "Pausado", color: "bg-gray-200 text-gray-600" },
  closed: { label: "Encerrado", color: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status }: { status?: ClientStatus | null }) {
  // se status for indefinido ou não mapeado, cai em "Desconhecido"
  const s = STATUS_MAP[status ?? ""] ?? {
    label: "Desconhecido",
    color: "bg-slate-100 text-slate-600",
  };

  return (
    <Badge className={`${s.color} text-xs px-2 py-1 rounded-full`}>
      {s.label}
    </Badge>
  );
}
