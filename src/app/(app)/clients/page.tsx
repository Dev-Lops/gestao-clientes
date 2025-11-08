// ✅ app/(app)/clients/page.tsx

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/session";
import Link from "next/link";

/* -------------------------------------------------------
   🔹 Página de listagem de clientes — versão refinada
---------------------------------------------------------- */
export default async function ClientsPage() {
  const { supabase, user, orgId } = await getSessionProfile();
  if (!user || !orgId) return null;

  // 🔹 Busca clientes
  const { data, error } = await supabase
    .from("app_clients")
    .select("id,name,status,plan,main_channel,created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("🚨 Erro ao carregar clientes:", error.message);
    return (
      <Card className="p-6 text-red-600 bg-rose-50 border-rose-200 shadow-sm">
        Erro ao carregar clientes: {error.message}
      </Card>
    );
  }

  const clients = data ?? [];

  // 🔹 Tradução EN → PT
  const STATUS_MAP: Record<string, string> = {
    new: "Novo",
    onboarding: "Onboarding",
    active: "Ativo",
    paused: "Pausado",
    closed: "Encerrado",
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300 p-8">
      {/* Cabeçalho sofisticado */}
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

      {/* Lista de clientes */}
      {!clients.length ? (
        <Card className="p-8 text-center border border-dashed text-slate-500 bg-slate-50">
          Nenhum cliente cadastrado ainda.{" "}
          <span className="block text-slate-400 text-sm mt-1">
            Comece adicionando o primeiro!
          </span>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => {
            const translatedStatus =
              STATUS_MAP[c.status as keyof typeof STATUS_MAP] ?? c.status;

            const badgeColor =
              translatedStatus === "Ativo"
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : translatedStatus === "Onboarding"
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : translatedStatus === "Pausado"
                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                    : translatedStatus === "Encerrado"
                      ? "bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200";

            return (
              <Card
                key={c.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Sombra decorativa */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Conteúdo */}
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg text-slate-900">
                      {c.name}
                    </h3>
                    <Badge
                      className={`${badgeColor} text-xs px-2 py-1 rounded-full`}
                    >
                      {translatedStatus}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-500">
                    {c.plan ?? "—"} • {c.main_channel ?? "—"}
                  </p>

                  <p className="text-xs text-slate-400">
                    Criado em{" "}
                    <span className="font-medium text-slate-500">
                      {new Date(c.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </p>

                  <div className="pt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-full border-slate-300 hover:bg-slate-100 hover:text-slate-900 text-slate-600 text-xs font-medium transition-all"
                    >
                      <Link href={`/clients/${c.id}/info`}>Ver detalhes</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
