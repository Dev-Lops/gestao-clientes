"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
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

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClientProgressCard } from "@/features/clients/components/ClientProgressCard";
import { ClientStatusBadge } from "@/features/clients/components/ClientStatusBadge";
import { DeleteClientButton } from "@/features/clients/components/DeleteClientButton";
import { EditClientDialog } from "@/features/clients/components/EditClientDialog";
import { InviteClientDialog } from "@/features/clients/components/InviteClientDialog";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { AppClient } from "@/types/tables";
import { ClientStatus } from "@/types/client";

type UserRole = "owner" | "staff" | "client" | null;

export default function ClientInfoPageClient({
  id,
  userRole,
}: {
  id: string;
  userRole: UserRole;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [client, setClient] = useState<AppClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("app_clients")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return toast.error("Cliente não encontrado.");

      setClient(data as AppClient);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar cliente.");
    } finally {
      setLoading(false);
    }
  }, [supabase, id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleSuccess = () => fetchClient();

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

  const canManageClient = userRole === "owner" || userRole === "staff";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto p-10 space-y-10 bg-white rounded-3xl shadow-xl border border-slate-200"
    >
      {/* Cabeçalho */}
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
            <Button
              variant="outline"
              className="flex items-center gap-1 border-slate-300"
            >
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Button>
          </Link>

          {canManageClient && (
            <>
              <Button
                onClick={() => setOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              >
                <Settings className="h-4 w-4" /> Editar
              </Button>
              <InviteClientDialog clientId={id} clientName={client.name} />
              <EditClientDialog
                open={open}
                setOpen={setOpen}
                client={client}
                onSuccess={handleSuccess}
              />
            </>
          )}

          <Link href={`/clients/${id}/media`}>
            <Button className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-700">
              <FolderOpen className="h-4 w-4" /> Pastas
            </Button>
          </Link>
          <Link href={`/clients/${id}/tasks`}>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-indigo-700 border-indigo-300 hover:bg-indigo-50"
            >
              <FilePlus2 className="h-4 w-4" /> Nova Task
            </Button>
          </Link>
        </div>
      </header>

      {/* Cards principais */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Status
          </p>
          <div className="mt-2">
            <ClientStatusBadge status={client.status as ClientStatus | null} />
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Responsável
          </p>
          <div className="mt-2 flex items-center gap-2 text-slate-800 font-medium">
            <User className="h-4 w-4 text-indigo-600" />
            {client.account_manager || "Não definido"}
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Pagamento
          </p>
          <div className="mt-2 flex items-center gap-2 text-slate-800 font-medium">
            <Coins className="h-4 w-4 text-amber-600" />
            {client.payment_status || "—"}
          </div>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            Próxima entrega
          </p>
          <div className="mt-2 flex items-center gap-2 text-slate-800 font-medium">
            <Calendar className="h-4 w-4 text-emerald-600" />
            {client.next_delivery
              ? new Date(client.next_delivery).toLocaleDateString("pt-BR")
              : "—"}
          </div>
        </Card>
      </section>

      {/* Progresso */}
      <ClientProgressCard value={progress} />

      {/* Observações */}
      <Card className="p-6 border border-slate-200 bg-white shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-indigo-600" /> Observações internas
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {client.internal_notes || "Sem observações adicionadas."}
        </p>
      </Card>

      {/* Cartões de ações */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Agenda
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Próximos eventos
              </h3>
            </div>
            <Calendar className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Planeje o próximo encontro com o cliente e acompanhe os
            compromissos.
          </p>
          <Link
            href={`/clients/${id}/meetings`}
            className="mt-6 inline-flex items-center gap-2 text-indigo-600 text-sm font-medium"
          >
            <Clock className="h-4 w-4" /> Ver agenda
          </Link>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Estratégia
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Diretrizes do projeto
              </h3>
            </div>
            <ClipboardList className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Revise os objetivos estratégicos, canais prioritários e entregas
            combinadas com o cliente.
          </p>
          <Link
            href={`/clients/${id}/strategy`}
            className="mt-6 inline-flex items-center gap-2 text-indigo-600 text-sm font-medium"
          >
            <ClipboardList className="h-4 w-4" /> Ver estratégia
          </Link>
        </Card>

        <Card className="p-5 border border-slate-200 shadow-sm hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                Financeiro
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Status de pagamentos
              </h3>
            </div>
            <Coins className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Consulte faturas, datas de cobrança e negociações pendentes.
          </p>
          <Link
            href={`/clients/${id}/finance`}
            className="mt-6 inline-flex items-center gap-2 text-indigo-600 text-sm font-medium"
          >
            <Coins className="h-4 w-4" /> Ver financeiro
          </Link>
        </Card>
      </section>

      {/* Ações finais */}
      {canManageClient && (
        <Card className="p-6 border border-slate-200 bg-red-50/80 text-red-700">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Zona de risco
          </h3>
          <p className="text-sm mb-4">
            Exclua o cliente permanentemente. Esta ação não pode ser desfeita.
          </p>
          <DeleteClientButton clientId={id} clientName={client.name} />
        </Card>
      )}
    </motion.div>
  );
}
