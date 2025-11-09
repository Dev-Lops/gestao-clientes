"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Edit2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { updateClientInfo } from "@/app/(app)/clients/[id]/info/actions";
import { EditClientDialog } from "@/components/EditClientDialog";


interface Client {
  id: string;
  name: string;
  status?: string;
  plan?: string;
  main_channel?: string;
  account_manager?: string;
  monthly_ticket?: number;
  billing_day?: number;
  payment_status?: string;
  payment_method?: string;
  meeting_date?: string;
  payment_date?: string;
  internal_notes?: string;
  progress?: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ClientProfile({ initialData }: { initialData: Client }) {
  const { data: client, mutate } = useSWR<Client>(
    `/api/client/${initialData.id}`,
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
    }
  );

  const [open, setOpen] = useState(false);

  async function handleSave(updated: Partial<Client>) {
    if (!client) return;

    try {
      mutate({ ...client, ...updated }, false);
      const result = await updateClientInfo(updated);
      if (result.ok) {
        toast.success("Informações atualizadas!");
        mutate();
        setOpen(false);
      } else {
        throw new Error(result.message || "Erro desconhecido");
      }
    } catch {
      toast.error("Erro ao salvar alterações");
      mutate();
    }
  }

  if (!client) return null;

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-8 bg-white/90 backdrop-blur rounded-3xl shadow-lg">
      <header className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-3xl font-semibold">{client.name}</h1>
          <p className="text-slate-600 text-sm">Plano: {client.plan}</p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Edit2 className="mr-2 h-4 w-4" /> Editar
        </Button>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Status</p>
          <h3 className="font-semibold mt-1">{client.status}</h3>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Pagamento</p>
          <h3 className="font-semibold mt-1">{client.payment_status || "—"}</h3>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Responsável</p>
          <h3 className="font-semibold mt-1">
            {client.account_manager || "—"}
          </h3>
        </Card>
      </div>

      <Card className="p-5">
        <p className="text-sm text-slate-500">Progresso</p>
        <Progress value={client.progress || 0} />
        <p className="text-xs mt-1">{client.progress || 0}% concluído</p>
      </Card>

      <EditClientDialog
        open={open}
        setOpen={setOpen}
        client={client}
        onSave={handleSave}
      />
    </div>
  );
}
