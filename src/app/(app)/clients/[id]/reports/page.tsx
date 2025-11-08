import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/session";
import { roleSatisfies } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";

type ReportsPageProps = {
  params: { id: string };
};

type ReportRow = {
  id: string;
  month: string;
  metrics: Record<string, unknown> | null;
  insights: string | null;
};

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  const date = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export default async function ReportsPage({ params }: ReportsPageProps) {
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

  const { data: reports, error } = await supabase
    .from("app_reports")
    .select("id, month, metrics, insights")
    .eq("client_id", id)
    .order("month", { ascending: false })
    .returns<ReportRow[]>();

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-red-600">Erro ao carregar relatórios</h2>
        <p className="text-sm text-red-500">{error.message}</p>
      </Card>
    );
  }

  const normalized = Array.isArray(reports) ? reports : [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Relatórios mensais</h1>
        <p className="text-sm text-slate-500">
          Consolide métricas e insights de performance para compartilhar com o cliente.
        </p>
      </header>

      {normalized.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-transparent p-6 text-center text-sm text-slate-500">
          Nenhum relatório cadastrado até o momento.
        </Card>
      ) : (
        <div className="space-y-4">
          {normalized.map((report) => (
            <Card key={report.id} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold uppercase text-slate-500">
                {formatMonthLabel(report.month)}
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-slate-700">Métricas principais</h2>
                <pre className="mt-2 overflow-x-auto rounded-xl bg-white/60 p-4 text-xs text-slate-700">
                  {JSON.stringify(report.metrics ?? {}, null, 2)}
                </pre>
              </div>
              <div className="text-sm text-slate-600">
                <strong>Insights:</strong> {report.insights ?? "—"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
