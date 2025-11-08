import { Card } from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/session";
import { roleSatisfies } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";

type MeetingsPageProps = {
  params: { id: string };
};

type MeetingRow = {
  id: string;
  date: string;
  summary: string | null;
  decisions: string | null;
  next_steps: string | null;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function MeetingsPage({ params }: MeetingsPageProps) {
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

  const { data: meetings, error } = await supabase
    .from("app_meetings")
    .select("id, date, summary, decisions, next_steps")
    .eq("client_id", id)
    .order("date", { ascending: false })
    .returns<MeetingRow[]>();

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-red-600">Erro ao carregar reuniões</h2>
        <p className="text-sm text-red-500">{error.message}</p>
      </Card>
    );
  }

  const normalized = Array.isArray(meetings) ? meetings : [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Reuniões</h1>
        <p className="text-sm text-slate-500">
          Histórico das reuniões registradas para este cliente, incluindo decisões e próximos passos.
        </p>
      </header>

      {normalized.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-transparent p-6 text-center text-sm text-slate-500">
          Nenhuma reunião registrada até o momento.
        </Card>
      ) : (
        <div className="space-y-4">
          {normalized.map((meeting) => (
            <Card key={meeting.id} className="space-y-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-medium text-slate-500">{formatDate(meeting.date)}</div>
              <h2 className="text-lg font-semibold text-slate-900">
                {meeting.summary ?? "Reunião sem título"}
              </h2>
              <div className="text-sm text-slate-600">
                <strong>Decisões:</strong> {meeting.decisions ?? "—"}
              </div>
              <div className="text-sm text-slate-600">
                <strong>Próximos passos:</strong> {meeting.next_steps ?? "—"}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
