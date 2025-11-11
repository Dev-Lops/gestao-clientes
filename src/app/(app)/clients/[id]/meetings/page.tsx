import { getSessionProfile } from "@/services/auth/session";
import { CalendarClock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClientMeetingsPage({ params }: PageProps) {
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
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <CalendarClock className="h-8 w-8" aria-hidden />
      </span>
      <h2 className="text-3xl font-semibold text-slate-900">
        Agenda de reuniões
      </h2>
      <p className="text-sm leading-relaxed text-slate-600">
        Em breve você poderá registrar atas, compromissos e decisões importantes
        diretamente por aqui. Aproveite o calendário geral enquanto construímos
        esta experiência.
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
