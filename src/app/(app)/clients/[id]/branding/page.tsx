import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { roleSatisfies } from "@/services/auth/rbac";
import { getSessionProfile } from "@/services/auth/session";
import { redirect } from "next/navigation";

type BrandingPageProps = {
  params: { id: string };
};

type ClientRow = {
  id: string;
  name: string;
  org_id: string | null;
};

type BrandingRow = {
  id: string;
  client_id: string;
  palette: string | null;
  font_stack: string | null;
  tone_of_voice: string | null;
  archetype: string | null;
  references: string[] | null;
  updated_at: string | null;
};

function formatList(value: string | string[] | null | undefined): string {
  if (!value) return "—";
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "—";
  }
  return value;
}

export default async function BrandingPage({ params }: BrandingPageProps) {
  const { id } = params;
  const session = await getSessionProfile();
  const { user, role, orgId } = session;
  const supabase = await createSupabaseServerClient();

  if (!user) {
    redirect("/login");
  }

  if (!roleSatisfies(role, "staff")) {
    redirect("/unauthorized");
  }

  const { data: client, error: clientError } = await supabase
    .from("app_clients")
    .select("id, name, org_id")
    .eq("id", id)
    .maybeSingle<ClientRow>();

  if (clientError) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-red-600">Erro ao carregar cliente</h2>
        <p className="text-sm text-red-500">{clientError.message}</p>
      </Card>
    );
  }

  if (!client) {
    redirect("/clients");
  }

  if (client.org_id && orgId && client.org_id !== orgId) {
    redirect("/unauthorized");
  }

  const { data: branding, error: brandingError } = await supabase
    .from("app_branding")
    .select("id, client_id, palette, font_stack, tone_of_voice, archetype, references, updated_at")
    .eq("client_id", client.id)
    .maybeSingle<BrandingRow>();

  if (brandingError) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-red-600">Erro ao carregar branding</h2>
        <p className="text-sm text-red-500">{brandingError.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Branding de {client.name}</h1>
        <p className="text-sm text-slate-500">
          Central de referência com paleta, tipografia, tom de voz e inspirações para a marca.
        </p>
      </header>

      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Identidade Visual</h2>
            <Separator className="bg-slate-200" />
            <dl className="space-y-2 text-sm text-slate-600">
              <div>
                <dt className="font-medium text-slate-800">Paleta</dt>
                <dd>{formatList(branding?.palette)}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-800">Tipografia</dt>
                <dd>{formatList(branding?.font_stack)}</dd>
              </div>
            </dl>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Personalidade</h2>
            <Separator className="bg-slate-200" />
            <dl className="space-y-2 text-sm text-slate-600">
              <div>
                <dt className="font-medium text-slate-800">Tom de voz</dt>
                <dd>{formatList(branding?.tone_of_voice)}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-800">Arquétipo</dt>
                <dd>{formatList(branding?.archetype)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <Separator className="my-6 bg-slate-200" />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Referências criativas</h2>
          <p className="text-sm text-slate-600">
            Utilize estas referências como ponto de partida para novas campanhas e materiais.
          </p>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
            {branding?.references && branding.references.length > 0 ? (
              <ul className="list-inside list-disc space-y-1">
                {branding.references.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <span>Nenhuma referência cadastrada até o momento.</span>
            )}
          </div>
        </section>

        <footer className="mt-6 text-xs text-slate-500">
          Última atualização: {branding?.updated_at ? new Date(branding.updated_at).toLocaleString("pt-BR") : "—"}
        </footer>
      </Card>
    </div>
  );
}
