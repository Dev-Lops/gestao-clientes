import { getSessionProfile } from "@/services/auth/session";
import { FileBarChart2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientReportsPage({ params }: PageProps) {
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
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <FileBarChart2 className="h-8 w-8" aria-hidden />
      </span>
      <h2 className="text-3xl font-semibold text-slate-900">
        Relatórios e resultados
      </h2>
      <p className="text-sm leading-relaxed text-slate-600">
        Em breve você poderá consolidar métricas, anexar arquivos e compartilhar
        apresentações com o cliente sem sair do painel. Enquanto isso, continue
        utilizando seus relatórios externos habituais.
      </p>
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
