"use client";

import { Clock } from "lucide-react";

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
      <Clock className="h-6 w-6 mb-3 animate-spin" />
      Carregando informações...
    </div>
  );
}
