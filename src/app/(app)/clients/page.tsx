// ✅ app/(app)/clients/page.tsx
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

// 🔄 Atualiza SSR a cada 1 minuto
export const revalidate = 60;

// 🔹 Tipagem completa e segura
export type ClientStatus = "new" | "onboarding" | "active" | "paused" | "closed";

export interface AppClient {
  id: string;
  name: string;
  status: ClientStatus;
  plan: string | null;
  main_channel: string | null;
  created_at: string;
}

export default async function ClientsPage() {
  const { user, orgId } = await getSessionProfile();

  // 🔒 Protege rota
  if (!user || !orgId)
    return (
      <Card className="p-8 text-center text-slate-500 bg-slate-50 border border-dashed space-y-3">
        <p>Você precisa estar autenticado para ver os clientes.</p>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/login">Ir para login</Link>
        </Button>
      </Card>
    );

  // 🔹 Cria cliente Supabase
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("app_clients")
    .select("id, name, status, plan, main_channel, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .returns<AppClient[]>(); // ✅ tipagem explícita

  if (error) {
    console.error("🚨 Erro ao carregar clientes:", error.message);
    return (
      <Card className="p-6 text-red-600 bg-rose-50 border-rose-200 shadow-sm">
        Erro ao carregar clientes: {error.message}
      </Card>
    );
  }

  const clients: AppClient[] = data ?? [];

  return (
    <div className="space-y-10 animate-in fade-in duration-300 p-8">
      {/* 🔹 Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium uppercase tracking-[0.15em] text-slate-400">
            Gestão de clientes
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Meus Clientes
          </h1>
          <p className="text-sm text-slate-500 max-w-md">
            Visualize e gerencie todos os clientes da sua organização com
            informações atualizadas e status em tempo real.
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="rounded-full bg-slate-900 hover:bg-slate-800 text-white px-6 shadow-md transition-all"
        >
          <Link href="/clients/new">➕ Novo Cliente</Link>
        </Button>
      </div>

      {/* 🔹 Lista de clientes */}
      {!clients.length ? (
        <Card className="p-8 text-center border border-dashed text-slate-500 bg-slate-50 space-y-2">
          <p className="text-lg font-medium">Nenhum cliente cadastrado ainda.</p>
          <p className="text-slate-400 text-sm">Que tal começar agora?</p>
          <Button asChild size="sm" className="mt-4 rounded-full">
            <Link href="/clients/new">➕ Adicionar Cliente</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card
              key={client.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg text-slate-900">
                    {client.name}
                  </h3>
                  <StatusBadge status={client.status} />
                </div>

                <p className="text-sm text-slate-500">
                  {client.plan ?? "—"} • {client.main_channel ?? "—"}
                </p>

                <p className="text-xs text-slate-400">
                  Criado em{" "}
                  <span className="font-medium text-slate-500">
                    {formatDate(client.created_at)}
                  </span>
                </p>

                <div className="pt-2 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="rounded-full border-slate-300 hover:bg-slate-100 hover:text-slate-900 text-slate-600 text-xs font-medium transition-all"
                  >
                    <Link href={`/clients/${client.id}/info`}>Ver detalhes</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
