import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/session";
import { roleSatisfies } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";

type StrategyPageProps = {
  params: { id: string };
};

type StrategyRow = {
  id: string;
  positioning: string | null;
  persona: string | null;
  content_pillars: string[] | null;
  key_messages: string | null;
  quarterly_goals: string | null;
  notes: string | null;
  updated_at: string | null;
};

function formatList(value: string[] | null | undefined) {
  if (!value || value.length === 0) return "—";
  return value.join(", ");
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { id } = params;
  const session = await getSessionProfile();
  const { supabase, role, orgId, user } = session;

  if (!user) {
    redirect("/login");
  }

  if (!roleSatisfies(role, "staff")) {
    redirect("/unauthorized");
  }

  const { data: clientOrg } = await supabase
    .from("app_clients")
    .select("org_id")
    .eq("id", id)
    .maybeSingle<{ org_id: string | null }>();

  if (clientOrg?.org_id && orgId && clientOrg.org_id !== orgId) {
    redirect("/unauthorized");
  }

  const { data: strategy, error } = await supabase
    .from("app_strategy")
    .select(
      "id, positioning, persona, content_pillars, key_messages, quarterly_goals, notes, updated_at"
    )
    .eq("client_id", id)
    .maybeSingle<StrategyRow>();

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-red-600">Erro ao carregar estratégia</h2>
        <p className="text-sm text-red-500">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Estratégia e Planejamento</h1>
        <p className="text-sm text-slate-500">
          Centralize os principais direcionamentos estratégicos antes de executar campanhas.
        </p>
      </header>

      <Card className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Posicionamento</h2>
          <p className="text-sm text-slate-600">{strategy?.positioning ?? "Defina a proposta de valor do cliente."}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Persona</h2>
          <p className="text-sm text-slate-600">{strategy?.persona ?? "Mapeie dores, desejos e objeções principais."}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Pilares de conteúdo</h2>
          <p className="text-sm text-slate-600">{formatList(strategy?.content_pillars)}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Mensagens chave</h2>
          <p className="text-sm text-slate-600">{strategy?.key_messages ?? "Liste argumentos, slogans e CTA prioritários."}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Metas trimestrais</h2>
          <p className="text-sm text-slate-600">{strategy?.quarterly_goals ?? "Defina objetivos SMART para o próximo trimestre."}</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">Notas adicionais</h2>
          <p className="text-sm text-slate-600">{strategy?.notes ?? "Inclua informações relevantes sobre concorrentes ou restrições."}</p>
        </section>

        <footer className="text-xs text-slate-500">
          Última atualização: {strategy?.updated_at ? new Date(strategy.updated_at).toLocaleString("pt-BR") : "—"}
        </footer>
      </Card>
    </div>
  );
}
