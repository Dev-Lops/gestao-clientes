"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";

interface Props {
  value: number;
  title?: string;
}

export function ClientProgressCard({ value, title = "Progresso Geral" }: Props) {
  const normalized = Math.max(0, Math.min(100, value || 0));

  return (
    <Card className="p-6 border border-slate-200 bg-slate-50 shadow-inner">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
          {title}
        </h3>
        <span className="text-sm font-semibold text-indigo-700">
          {normalized}%
        </span>
      </div>
      <Progress value={normalized} />
    </Card>
  );
}
