"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { DashboardSkeleton } from "@/components/shared/skeletons/dashboard-skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useAppStore } from "@/store/appStore";
import type {
  AppClient,
  AppTask,
  ContentCalendarItem,
} from "@/types/tables";

// rótulos que tu já usa
const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  onboarding: "Onboarding",
  active: "Ativo",
  paused: "Pausado",
  closed: "Encerrado",
};

// helperzinho pra hoje
function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <RealtimeDashboard />
    </Suspense>
  );
}

function RealtimeDashboard() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const setTable = useAppStore((s) => s.setTable);
  const orgId = useAppStore((s) => s.orgId);

  // dados já carregados na store (se tiver)
  const clients =
    ((useAppStore((s) => s.tables.app_clients) as AppClient[]) ?? []) || [];
  const tasks =
    ((useAppStore((s) => s.tables.app_tasks) as AppTask[]) ?? []) || [];
  const agenda =
    ((useAppStore((s) => s.tables.app_content_calendar) as ContentCalendarItem[]) ??
      []) || [];

  const [loading, setLoading] = useState(clients.length === 0);
  const [error, setError] = useState<string | null>(null);
  const bootstrapped = useRef(false);

  // carregar do supabase quando não tiver na store ou quando mudou org
  useEffect(() => {
    if (!orgId) return;
    if (bootstrapped.current && clients.length > 0) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const [clientsRes, tasksRes, agendaRes] = await Promise.all([
          supabase
            .from("app_clients")
            .select("id, org_id, name, status, plan, created_at")
            .eq("org_id", orgId ?? "")
            .order("created_at", { ascending: false })
            .limit(30),

          supabase
            .from("app_tasks")
            .select("id, org_id, client_id, title, status, urgency, due_date, created_at")
            .eq("org_id", orgId ?? "")
            .order("created_at", { ascending: false })
            .limit(50),

          supabase
            .from("app_content_calendar")
            .select("id, org_id, title, event_date, notes, channel, created_at")
            .eq("org_id", orgId ?? "")
            .order("event_date", { ascending: true })
            .limit(20),
        ]);


        if (
          clientsRes.error ||
          tasksRes.error ||
          agendaRes.error
        ) {
          throw (
            clientsRes.error ||
            tasksRes.error ||
            agendaRes.error
          );
        }

        if (cancelled) return;

        setTable("app_clients", clientsRes.data ?? []);
        setTable("app_tasks", tasksRes.data ?? []);
        setTable("app_content_calendar", agendaRes.data ?? []);

        bootstrapped.current = true;
        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        if (!cancelled) {
          setError("Não foi possível carregar os dados.");
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [orgId, supabase, setTable, clients.length]);

  if (!orgId) {
    // usuário ainda não tem org resolvida
    return <DashboardSkeleton />;
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 font-medium">{error}</div>
    );
  }

  // =========================================================
  //  CÁLCULOS DERIVADOS (aqui está o segredo da contagem)
  // =========================================================

  const activeClients = clients.filter((c) => c.status === "active").length;
  const onboardingClients = clients.filter(
    (c) => c.status === "onboarding"
  ).length;
  const pausedClients = clients.filter((c) => c.status === "paused").length;

  const urgentTasks = tasks.filter(
    (t) =>
      (t.urgency === "high" || t.urgency === "critical") &&
      t.status !== "done"
  );

  const lateTasks = tasks.filter((t) => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    const today = new Date();
    return due < today && t.status !== "done";
  });

  const todayTasks = tasks.filter(
    (t) => t.due_date && isToday(t.due_date) && t.status !== "done"
  );

  // ordem de prioridade pro bloco "Prioridades do dia"
  const priorities = [
    ...urgentTasks,
    ...lateTasks.filter((lt) => !urgentTasks.find((u) => u.id === lt.id)),
    ...todayTasks.filter(
      (tt) =>
        !urgentTasks.find((u) => u.id === tt.id) &&
        !lateTasks.find((l) => l.id === tt.id)
    ),
  ].slice(0, 6);

  return (
    <motion.div
      className="space-y-10 p-8 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* =========================================================
          1. VISÃO GERAL
      ========================================================= */}
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
            Visão geral
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Painel de Gestão
          </h1>
          <p className="max-w-xl text-sm text-slate-500">
            Leitura rápida do que está vivo na operação: clientes, tarefas e
            agenda.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/clients/new">➕ Novo cliente</Link>
        </Button>
      </header>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          icon="🟢"
          label="Clientes ativos"
          value={activeClients}
          color="bg-emerald-500/10 text-emerald-700"
        />
        <KpiCard
          icon="🟡"
          label="Onboarding"
          value={onboardingClients}
          color="bg-amber-500/10 text-amber-700"
        />
        <KpiCard
          icon="🟣"
          label="Pausados"
          value={pausedClients}
          color="bg-purple-500/10 text-purple-700"
        />
        <KpiCard
          icon="🔥"
          label="Tarefas urgentes"
          value={urgentTasks.length}
          color="bg-red-500/10 text-red-700"
        />
        <KpiCard
          icon="🕒"
          label="Entregas hoje"
          value={todayTasks.length}
          color="bg-blue-500/10 text-blue-700"
        />
      </section>

      {/* =========================================================
          2. AÇÃO (PRIORIDADES)
      ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Prioridades do dia
          </h2>
          <Link
            href="/tasks"
            className="text-xs text-indigo-600 hover:underline"
          >
            ver tudo
          </Link>
        </div>

        {priorities.length === 0 ? (
          <Card className="p-6 text-sm text-slate-500">
            Nada urgente agora. Universo em equilíbrio ✨
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {priorities.map((task) => (
              <Card
                key={task.id}
                className="p-4 flex flex-col gap-2 border-l-4 border-red-400 bg-white/70"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-800">{task.title}</p>
                  {task.urgency ? (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700 uppercase tracking-wide">
                      {task.urgency}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500">
                  {task.due_date
                    ? `Prazo: ${new Date(
                      task.due_date
                    ).toLocaleDateString("pt-BR")}`
                    : "Sem prazo"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================
          3. FUTURO (AGENDA / PRÓXIMOS)
      ========================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Próximas atividades
          </h2>
          <Link
            href="/calendar"
            className="text-xs text-indigo-600 hover:underline"
          >
            ver agenda
          </Link>
        </div>

        {agenda.length === 0 ? (
          <Card className="p-6 text-sm text-slate-500">
            Nenhum evento agendado.
          </Card>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {agenda.map((event) => (
              <Card
                key={event.id}
                className="min-w-[200px] p-4 bg-white shadow-sm hover:shadow-md transition rounded-2xl border border-slate-200"
              >
                <p className="text-sm font-medium text-slate-900">
                  {event.title ?? "Sem título"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {event.event_date
                    ? new Date(event.event_date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })
                    : "Data não definida"}
                </p>
                {event.notes ? (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {event.notes}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================
          4. CLIENTES RECENTES
      ========================================================= */}
      <section className="space-y-3 pb-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Últimos clientes
          </h2>
          <Link
            href="/clients"
            className="text-xs text-indigo-600 hover:underline"
          >
            ver todos
          </Link>
        </div>

        {clients.length === 0 ? (
          <Card className="p-6 text-sm text-slate-500">
            Nenhum cliente cadastrado ainda.
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clients.slice(0, 6).map((client) => {
              const label =
                STATUS_LABELS[client.status ?? ""] ??
                client.status ??
                "Desconhecido";
              const color =
                client.status === "active"
                  ? "text-emerald-600"
                  : client.status === "onboarding"
                    ? "text-amber-500"
                    : client.status === "paused"
                      ? "text-orange-500"
                      : "text-slate-500";

              return (
                <Card
                  key={client.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                >
                  <h3 className="font-medium text-slate-900">
                    {client.name ?? "Sem nome"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Status: <span className={color}>{label}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Criado em:{" "}
                    {client.created_at
                      ? new Date(client.created_at).toLocaleDateString(
                        "pt-BR",
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      )
                      : "—"}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
}

// componentezinho pros cards do topo
function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card
      className={`p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 ${color}`}
    >
      <div className="text-3xl leading-none">{icon}</div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </Card>
  );
}
