// app/clients/[id]/page.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

type ClientTabsLayoutProps = { params: Promise<{ id: string }> };

export default async function ClientTabsLayout({
  params,
}: ClientTabsLayoutProps) {
  const { id } = await params;
  const base = `/clients/${id}`;

  const tabs = [
    { value: "info", label: "Informações", href: `${base}/info` },
    { value: "tasks", label: "Tarefas", href: `${base}/tasks` },
    { value: "branding", label: "Branding", href: `${base}/branding` },
    { value: "media", label: "Mídias", href: `${base}/media` },
    { value: "strategy", label: "Estratégia", href: `${base}/strategy` },
    { value: "meetings", label: "Reuniões", href: `${base}/meetings` },
    { value: "finance", label: "Financeiro", href: `${base}/finance` },
    { value: "reports", label: "Relatórios", href: `${base}/reports` },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cliente</h1>
      <Tabs defaultValue="info">
        <TabsList className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link key={tab.value} href={tab.href}>
              <TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
            </Link>
          ))}
        </TabsList>
      </Tabs>
      <p className="text-sm opacity-70">
        Escolha uma das seções acima para visualizar os detalhes do cliente.
      </p>
    </div>
  );
}
