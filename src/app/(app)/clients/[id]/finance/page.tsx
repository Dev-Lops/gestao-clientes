import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";
import { roleSatisfies } from "@/services/auth/rbac";
import { redirect } from "next/navigation";

type FinancePageProps = {
  params: Promise<{ id: string }>;
};

type PaymentRow = {
  id: string;
  amount: number | null;
  paid_at: string | null;
  method: string | null;
  notes: string | null;
};

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number") return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function FinancePage({ params }: FinancePageProps) {
  const { id } = await params;
  const session = await getSessionProfile();
  const { role, orgId, user } = session;
  const supabase = await createSupabaseServerClient();

  if (!user) {
    redirect("/login");
  }

  if (!roleSatisfies(role, "owner")) {
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

  const { data: payments, error } = await supabase
    .from("app_payments")
    .select("id, amount, paid_at, method, notes")
    .eq("client_id", id)
    .order("paid_at", { ascending: false })
    .returns<PaymentRow[]>();

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-red-600">
          Erro ao carregar pagamentos
        </h2>
        <p className="text-sm text-red-500">{error.message}</p>
      </Card>
    );
  }

  const normalized = Array.isArray(payments) ? payments : [];
  const total = normalized.reduce<number>(
    (acc, payment) => acc + Number(payment.amount ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Financeiro</h1>
        <p className="text-sm text-slate-500">
          Resumo das cobranças e recebimentos do cliente.
        </p>
      </header>

      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase text-slate-500">
              Total Recebido
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {formatCurrency(total)}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase text-slate-500">
              Pagamentos
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {normalized.length}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-medium uppercase text-slate-500">
              Último recebimento
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {normalized[0]?.paid_at ? formatDate(normalized[0].paid_at) : "—"}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {normalized.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-transparent p-6 text-center text-sm text-slate-500">
              Nenhum pagamento registrado até o momento.
            </Card>
          ) : (
            normalized.map((payment) => (
              <Card
                key={payment.id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <strong className="text-lg text-slate-900">
                    {formatCurrency(payment.amount ?? 0)}
                  </strong>
                  <span className="text-sm text-slate-500">
                    {formatDate(payment.paid_at)}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  Método: {payment.method ?? "—"}
                </div>
                {payment.notes ? (
                  <p className="text-sm text-slate-500">{payment.notes}</p>
                ) : null}
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
