import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

export const metadata = {
  title: "Acesso não autorizado",
};

type UnauthorizedPageProps = {
  searchParams?: Promise<{ reason?: string; from?: string }>;
};

const REASON_COPY: Record<
  string,
  {
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
  }
> = {
  no_membership: {
    title: "Você ainda não faz parte de uma organização",
    description:
      "Peça para um administrador enviar um convite ou utilize um e-mail autorizado para criar sua conta.",
    actionLabel: "Voltar para o login",
    actionHref: "/login",
  },
  forbidden: {
    title: "Sem permissão para acessar esta área",
    description:
      "Seu usuário não possui o nível de acesso necessário. Tente voltar ao painel principal ou entre em contato com um administrador.",
  },
};

export default async function UnauthorizedPage({
  searchParams,
}: UnauthorizedPageProps) {
  const params = (await searchParams) ?? {};
  const reason = params.reason ?? "";
  const fallbackLink = params.from ?? "/dashboard";

  const copy = REASON_COPY[reason] ?? {
    title: "Acesso negado",
    description:
      "Não foi possível autorizar sua entrada neste recurso. Caso acredite que isso seja um erro, procure o responsável pela conta.",
  };

  const primaryHref = copy.actionHref ?? fallbackLink;
  const primaryLabel = copy.actionLabel ?? "Voltar";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-slate-50 px-6 py-16 text-slate-800">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold">{copy.title}</h1>
        <p className="text-sm text-slate-600">{copy.description}</p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {primaryLabel}
        </Link>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
        >
          <Home className="h-4 w-4" aria-hidden />
          Ir para o painel
        </Link>
      </div>
    </main>
  );
}
