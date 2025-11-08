"use client";

import { Card } from "@/components/ui/card";
import { fetcher } from "@/lib/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";

import { EditClient } from "./EditClient";

export default function ClientInfoPage() {
  const { id } = useParams<{ id: string }>();
  const { data: client, error, mutate, isLoading } = useSWR(`/api/client/get?id=${id}`, fetcher);

  if (error) return <p className="text-red-500 p-6">Erro ao carregar cliente.</p>;
  if (isLoading) return <p className="p-6 text-slate-500 animate-pulse">Carregando...</p>;

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">{client.name}</h1>
        <EditClient client={client} onUpdated={() => mutate()} />
      </header>

      <Card className="p-6 space-y-2">
        <p><strong>Status:</strong> {client.status}</p>
        <p><strong>Plano:</strong> {client.plan}</p>
        <p><strong>Responsável:</strong> {client.account_manager || "—"}</p>
        <p><strong>Pagamento:</strong> {client.payment_status || "—"}</p>
        <p><strong>Canal:</strong> {client.main_channel}</p>
      </Card>
    </div>
  );
}
