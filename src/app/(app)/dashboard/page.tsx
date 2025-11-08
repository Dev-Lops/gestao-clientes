"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/appStore";
import type {
  AppClient,
  AppTask,
  ContentCalendarItem,
  OrgClientStats,
} from "@/types/tables";

const EMPTY_CLIENTS: AppClient[] = [];
const EMPTY_TASKS: AppTask[] = [];
const EMPTY_CALENDAR_ITEMS: ContentCalendarItem[] = [];
const EMPTY_STATS: OrgClientStats[] = [];

const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  onboarding: "Onboarding",
  active: "Ativo",
  paused: "Pausado",
  closed: "Encerrado",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <RealtimeDashboard />
    </Suspense>
  );
}

function RealtimeDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const setTable = useAppStore((state) => state.setTable);
  const orgId = useAppStore((state) => state.orgId);

  const clients =
    useAppStore((state) => state.tables.app_clients as AppClient[] | undefined) ??
    EMPTY_CLIENTS;
  const tasks =
    useAppStore((state) => state.tables.app_tasks as AppTask[] | undefined) ?? EMPTY_TASKS;
  const agendaItems =
    useAppStore(
      (state) => state.tables.app_content_calendar as ContentCalendarItem[] | undefined,
    ) ?? EMPTY_CALENDAR_ITEMS;
  const stats =
    (useAppStore(
      (state) => state.tables.org_client_stats as OrgClientStats[] | undefined,
    ) ?? EMPTY_STATS)[0] ?? null;

  const [loading, setLoading] = useState(() => clients.length === 0);
  const [error, setError] = useState<string | null>(null);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!orgId) {
      return;
    }

    if (bootstrappedRef.current) {
      return;
    }

    if (clients.length > 0) {
      bootstrappedRef.current = true;
      setLoading(false);
      return;
    }

    let ignore = false;

    async function fetchData() {
      try {
        setLoading(true);

        const [statsRes, clientsRes, tasksRes, agendaRes] = await Promise.all([
          supabase
            .from("org_client_stats")
            .select("id, org_id, total, ativos, onboarding, pausados, media_progresso")
            .eq("org_id", orgId)
            .limit(1),
          supabase
            .from("app_clients")
            .select("id, org_id, name, status, plan, main_channel, created_at")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("app_tasks")
            .select("id, org_id, client_id, title, status, due_date, urgency")
            .eq("org_id", orgId)
            .limit(20),
          supabase
            .from("app_content_calendar")
            .select("id, org_id, created_by, date, title, notes, channel")
            .eq("org_id", orgId)
            .order("date", { ascending: true })
            .limit(14),
        ]);

        if (ignore) return;

        if (statsRes.error || clientsRes.error || tasksRes.error || agendaRes.error) {
          throw (
            statsRes.error || clientsRes.error || tasksRes.error || agendaRes.error
          );
        }

        setTable("org_client_stats", statsRes.data ?? []);
        setTable("app_clients", clientsRes.data ?? []);
        setTable("app_tasks", tasksRes.data ?? []);
        setTable("app_content_calendar", agendaRes.data ?? []);

        bootstrappedRef.current = true;
        setLoading(false);
      } catch (err) {
        console.error("🚨 Dashboard error:", err);
        if (!ignore) {
          setError("Falha ao carregar dados.");
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [clients.length, orgId, setTable, supabase]);

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        router.refresh();
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [error, router]);

  if (!orgId) {
    return <DashboardSkeleton />;
  }

  if (loading) return <DashboardSkeleton />;
  if (error)
    return <div className="p-10 text-center text-red-600 font-medium">{error}</div>;

  const { ativos, onboarding, pausados, media_progresso } = stats ?? {};

  const atrasadas = tasks.filter((task) => ["blocked", "todo"].includes(task.status)).length;
  const urgentes = tasks.filter(
    (task) => ["high", "critical"].includes(task.urgency) && task.status !== "done",
  ).length;

  const kpis = [
    { label: "Clientes ativos", value: ativos ?? 0, helper: "em acompanhamento" },
    { label: "Em onboarding", value: onboarding ?? 0, helper: "em integração" },
    { label: "Pausados", value: pausados ?? 0, helper: "aguardando retorno" },
    {
      label: "Média de progresso",
      value: `${media_progresso ?? 0}%`,
      helper: "dos planos ativos",
    },
  ];

  return (
    <motion.div
      className="space-y-10 p-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Visão geral
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Painel de Controle</h1>
          <p className="max-w-xl text-sm text-slate-500">
            Tudo em tempo real — clientes, tarefas e agenda se atualizam automaticamente.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/clients/new">➕ Novo cliente</Link>
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase text-slate-400 tracking-widest">
                  {item.helper}
                </span>
                <span className="text-3xl font-semibold text-slate-900">{item.value}</span>
                <span className="text-sm text-slate-500">{item.label}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </section>

      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
        <span>🔥 {urgentes} tarefas urgentes</span>
        <span>⏰ {atrasadas} tarefas atrasadas</span>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Últimos clientes</h2>
        {clients.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum cliente cadastrado ainda.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => {
              const label = STATUS_LABELS[client.status] ?? client.status;

              const badgeClass =
                label === "Ativo"
                  ? "text-green-600"
                  : label === "Onboarding"
                  ? "text-yellow-600"
                  : label === "Pausado"
                  ? "text-orange-500"
                  : label === "Encerrado"
                  ? "text-red-500"
                  : "text-slate-500";

              return (
                <motion.div key={client.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium text-slate-900">{client.name}</h3>
                      <p className="text-xs text-slate-500">
                        Status: <span className={badgeClass}>{label}</span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Criado em: {new Date(client.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Próximos compromissos (14 dias)
        </h2>
        {agendaItems.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum evento agendado.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agendaItems.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                  <h3 className="font-medium text-slate-900">{event.title ?? "Sem título"}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(event.date).toLocaleDateString("pt-BR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                  {event.notes && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">{event.notes}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
