// ✅ app/(app)/clients/[id]/tasks/page.tsx

import { DeleteTaskButton } from "@/features/tasks/components/DeleteTaskButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";
import { redirect } from "next/navigation";
import { createTask, toggleTask } from "./actions";

/* -------------------------------------------------------
   🔹 Tipagens
---------------------------------------------------------- */
type Task = {
  id: string;
  title: string;
  status: "Pendente" | "Concluída" | "Atrasada";
  due_date: string | null;
  completed_at: string | null;
  urgency: number;
  client_id: string;
};

type ProgressSummary = {
  progress_pct: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
};

/* -------------------------------------------------------
   🔹 Página principal
---------------------------------------------------------- */
export default async function TasksPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: clientId } = params;
  const { user } = await getSessionProfile();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServerClient();

  const { data: client } = await supabase
    .from("app_clients")
    .select("created_by,name")
    .eq("id", clientId)
    .maybeSingle();

  if (!client) redirect("/clients");

  const canManage = client.created_by === user.id;

  const { data: tasks } = await supabase
    .from("app_tasks")
    .select("id,title,status,due_date,completed_at,urgency,client_id")
    .eq("client_id", clientId)
    .order("urgency", { ascending: false })
    .order("due_date", { ascending: true })
    .returns<Task[]>();

  const { data: progressRow } = await supabase
    .from("app_client_progress")
    .select("progress_pct,total_tasks,completed_tasks,pending_tasks")
    .eq("client_id", clientId)
    .maybeSingle<ProgressSummary>();

  const pct = Number(progressRow?.progress_pct ?? 0);
  const totalTasks = Number(progressRow?.total_tasks ?? 0);
  const completedTasks = Number(progressRow?.completed_tasks ?? 0);
  const pendingTasks = Number(
    progressRow?.pending_tasks ?? Math.max(totalTasks - completedTasks, 0)
  );

  /* -------------------------------------------------------
     🔹 UI sofisticada
  ---------------------------------------------------------- */
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
            📋 Tarefas de <span className="text-indigo-600">{client?.name}</span>
          </h2>
          <p className="text-sm text-slate-500">
            Gerencie, acompanhe e finalize tarefas com estilo.
          </p>
        </div>

        <Badge
          variant="secondary"
          className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-sm font-medium"
        >
          {completedTasks} de {totalTasks} concluídas • {pendingTasks} pendentes ({pct}%)
        </Badge>
      </div>

      {/* Criar tarefa */}
      {canManage && (
        <Card className="p-6 border border-slate-200 shadow-sm bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl">
          <form
            action={createTask}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <input type="hidden" name="clientId" value={clientId} />
            <div className="flex flex-col">
              <label htmlFor="title" className="text-sm text-slate-600 mb-1 font-medium">
                Título
              </label>
              <input
                id="title"
                name="title"
                placeholder="Digite o nome da tarefa..."
                className="h-10 w-full rounded-lg border border-slate-300 bg-white/70 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="due_date" className="text-sm text-slate-600 mb-1 font-medium">
                Prazo
              </label>
              <input
                id="due_date"
                type="date"
                name="due_date"
                className="h-10 rounded-lg border border-slate-300 bg-white/70 px-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="urgency" className="text-sm text-slate-600 mb-1 font-medium">
                Urgência
              </label>
              <select
                id="urgency"
                name="urgency"
                className="h-10 rounded-lg border border-slate-300 bg-white/70 px-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
              >
                <option value="0">Baixa</option>
                <option value="1">Média</option>
                <option value="2">Alta</option>
              </select>
            </div>
            <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md">
              ➕ Adicionar
            </Button>
          </form>
        </Card>
      )}

      {/* Lista de tarefas */}
      <div className="space-y-2">
        {(tasks ?? []).map((t: Task) => {
          const isLate =
            t.status === "Atrasada" ||
            (t.due_date &&
              new Date(t.due_date) < new Date() &&
              t.status !== "Concluída");

          const urgencyColor =
            t.urgency === 2
              ? "border-l-4 border-red-400"
              : t.urgency === 1
                ? "border-l-4 border-yellow-400"
                : "border-l-4 border-slate-300";

          return (
            <Card
              key={t.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm border border-slate-200",
                urgencyColor
              )}
            >
              <div className="flex items-center gap-4">
                {canManage && (
                  <form action={toggleTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="clientId" value={clientId} />
                    <input type="hidden" name="status" value={t.status} />
                    <Button
                      type="submit"
                      variant={t.status === "Concluída" ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "rounded-full w-7 h-7 flex items-center justify-center text-xs font-medium",
                        t.status === "Concluída"
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "hover:bg-slate-100"
                      )}
                    >
                      {t.status === "Concluída" ? "✓" : "○"}
                    </Button>
                  </form>
                )}
                <div
                  className={cn(
                    "text-sm font-medium text-slate-800",
                    t.status === "Concluída" && "line-through text-slate-500"
                  )}
                >
                  {t.title}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                {t.due_date && (
                  <span
                    className={cn(
                      "font-medium",
                      isLate && "text-red-600"
                    )}
                  >
                    {isLate
                      ? `Atrasada (${new Date(t.due_date).toLocaleDateString("pt-BR")})`
                      : `Prazo: ${new Date(t.due_date).toLocaleDateString("pt-BR")}`}
                  </span>
                )}
                {canManage && (
                  <DeleteTaskButton
                    id={t.id}
                    clientId={clientId}
                  />
                )}
              </div>
            </Card>
          );
        })}

        {/* Nenhuma tarefa */}
        {(!tasks || tasks.length === 0) && (
          <Card className="p-6 text-sm text-slate-500 text-center bg-white/70 border border-slate-200 rounded-xl shadow-sm">
            Nenhuma tarefa criada ainda. <br />
            <span className="text-slate-400">Adicione a primeira acima 👆</span>
          </Card>
        )}
      </div>
    </div>
  );
}
