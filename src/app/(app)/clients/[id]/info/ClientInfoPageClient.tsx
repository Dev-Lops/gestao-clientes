"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ClipboardList,
  Clock,
  Coins,
  FilePlus2,
  FileText,
  FolderOpen,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EditClientDialog } from "@/components/EditClientDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ClientInfoPageClientProps {
  id: string;
  role: string | null;
}

type Client = {
  id: string;
  name: string;
  plan?: string;
  status?: string;
  main_channel?: string;
  account_manager?: string;
  payment_status?: string;
  payment_method?: string;
  billing_day?: number;
  monthly_ticket?: number;
  start_date?: string;
  next_delivery?: string;
  last_meeting_at?: string;
  progress?: number;
  internal_notes?: string;
};

export function ClientInfoPageClient({ id, role }: ClientInfoPageClientProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const canEdit = role === "owner" || role === "admin";

  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("app_clients")
        .select("*")
        .eq("id", id)
        .maybeSingle<Client>();

      if (error) throw error;
      if (!data) {
        toast.error("Cliente não encontrado.");
        return;
      }

      setClient(data);
    } catch (err) {
      console.error("Erro ao carregar cliente:", err);
      toast.error("Erro ao carregar informações do cliente.");
    } finally {
      setLoading(false);
    }
  }, [supabase, id]);

  useEffect(() => {
    void fetchClient();
  }, [fetchClient]);

  const handleSave = useCallback(
    async (data: Partial<Client>) => {
      if (!canEdit) {
        toast.error("Você não possui permissão para editar este cliente.");
        return;
      }

      const { error } = await supabase.from("app_clients").update(data).eq("id", id);

      if (error) {
        toast.error("Erro ao atualizar cliente.");
        return;
      }

      setOpen(false);
      void fetchClient();
    },
    [canEdit, fetchClient, id, supabase]
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
        <Clock className="h-6 w-6 mb-3 animate-spin" />
        Carregando informações...
      </div>
    );

  if (!client)
    return (
      <div className="p-10 text-center text-red-600 font-medium">
        Cliente não encontrado.
      </div>
    );

  const progress = client.progress ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto p-10 space-y-10 bg-white rounded-3xl shadow-xl border border-slate-200"
    >
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <User className="h-7 w-7 text-indigo-600" />
            {client.name}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {client.plan} • {client.main_channel || "Canal não definido"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/clients">
            <Button variant="outline" className="flex items-center gap-1 border-slate-300">
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>
          <Button
            onClick={() => setOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            disabled={!canEdit}
          >
            <Settings className="h-4 w-4" /> Editar
          </Button>
          <Link href={`/clients/${id}/files`}>
            <Button className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-700">
              <FolderOpen className="h-4 w-4" /> Pastas
            </Button>
          </Link>
          <Link href={`/clients/${id}/tasks/new`}>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-indigo-700 border-indigo-300 hover:bg-indigo-50"
            >
              <FilePlus2 className="h-4 w-4" /> Nova Task
            </Button>
          </Link>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
          <Badge
            variant="outline"
            className={`mt-2 px-2 py-1 text-sm font-medium rounded-md ${
              client.status === "Ativo"
                ? "border-green-500 text-green-700 bg-green-50"
                : client.status === "Pausado"
                ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                : client.status === "Cancelado"
                ? "border-red-500 text-red-700 bg-red-50"
                : client.status === "Em Onboarding"
                ? "border-indigo-500 text-indigo-700 bg-indigo-50"
                : "border-slate-400 text-slate-600 bg-slate-50"
            }`}
          >
            {client.status || "—"}
          </Badge>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Responsável</p>
          <div className="mt-2 flex items-center gap-2 text-slate-800 font-medium">
            <User className="h-4 w-4 text-indigo-600" />
            {client.account_manager || "Não definido"}
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Pagamento</p>
          <div className="mt-2 flex items-center gap-2 text-slate-800 font-medium">
            <Coins className="h-4 w-4 text-amber-600" />
            {client.payment_status || "—"}
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Próxima entrega</p>
          <div className="mt-2 flex items-center gap-2 text-slate-800 font-medium">
            <Calendar className="h-4 w-4 text-emerald-600" />
            {client.next_delivery
              ? new Date(client.next_delivery).toLocaleDateString("pt-BR")
              : "Sem data"}
          </div>
        </Card>
      </section>

      <section className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <Card className="p-6 space-y-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-indigo-600" /> Informações gerais
            </h2>
            <Badge variant="secondary" className="uppercase tracking-wide text-xs">
              Plano {client.plan || "não informado"}
            </Badge>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Método de pagamento</p>
              <p className="font-medium text-slate-800">
                {client.payment_method || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Status do pagamento</p>
              <p className="font-medium text-slate-800">
                {client.payment_status || "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Dia de cobrança</p>
              <p className="font-medium text-slate-800">
                {client.billing_day ? `Todo dia ${client.billing_day}` : "Não definido"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Ticket mensal</p>
              <p className="font-medium text-slate-800">
                {client.monthly_ticket
                  ? client.monthly_ticket.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "Não definido"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Início do contrato</p>
              <p className="font-medium text-slate-800">
                {client.start_date
                  ? new Date(client.start_date).toLocaleDateString("pt-BR")
                  : "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Última reunião</p>
              <p className="font-medium text-slate-800">
                {client.last_meeting_at
                  ? new Date(client.last_meeting_at).toLocaleDateString("pt-BR")
                  : "Sem registro"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" /> Progresso geral
          </h2>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Avanço do projeto</span>
            <span className="font-semibold text-slate-700">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Este indicador resume o andamento das entregas combinadas com o cliente.
            Atualize as tarefas para manter esse valor preciso.
          </p>
        </Card>
      </section>

      <Card className="p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" /> Notas internas
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
          {client.internal_notes || "Sem anotações no momento."}
        </p>
      </Card>

      <EditClientDialog open={open} setOpen={setOpen} client={client} onSave={handleSave} />
    </motion.div>
  );
}
