import { getSessionProfile } from "@/services/auth/session";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientStrategyPage({ params }: PageProps) {
  const { id } = await params;
  const { user, orgId } = await getSessionProfile();

  if (!user) {
    redirect("/login");
  }

  if (!orgId) {
    redirect("/setup");
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-dashed border-slate-200 bg-white/80 p-12 text-center shadow-sm">
      <h2 className="text-3xl font-semibold text-slate-900">
        Planejamento estratégico
      </h2>
      <p className="text-sm leading-relaxed text-slate-600">
        Esta área será utilizada para documentar planos de ação, metas e
        jornadas do cliente. Enquanto finalizamos a implementação, mantenha
        esses registros em seus documentos de referência.
      </p>
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
        Em desenvolvimento 🚧
      </div>
      <Link
        href={`/clients/${id}/info`}
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Voltar para informações do cliente
      </Link>
    </section>
  );
}
