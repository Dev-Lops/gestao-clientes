"use client";

import { Badge } from "@/components/ui/badge";
import type { ClientStatus } from "@/types/client";
import { getStatusLabel } from "@/lib/utils/status";

export function ClientStatusBadge({ status }: { status?: ClientStatus }) {
  const label = getStatusLabel(status);

  const colorClass =
    status === "active"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
      : status === "onboarding"
        ? "bg-amber-100 text-amber-700 border border-amber-200"
        : status === "paused"
          ? "bg-orange-100 text-orange-700 border border-orange-200"
          : status === "closed"
            ? "bg-rose-100 text-rose-700 border border-rose-200"
            : "bg-slate-100 text-slate-700 border border-slate-200";

  return (
    <Badge className={`${colorClass} text-xs px-2 py-1 rounded-full capitalize`}>
      {label}
    </Badge>
  );
}
