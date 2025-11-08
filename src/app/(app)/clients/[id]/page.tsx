// app/clients/[id]/page.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

type ClientTabsLayoutProps = { params: Promise<{ id: string }> };

export default async function ClientTabsLayout({ params }: ClientTabsLayoutProps) {
  const { id } = await params;
  const base = `/clients/${id}`;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Cliente</h1>
      <Tabs defaultValue="info">
        <TabsList className="flex flex-wrap gap-2">
          <Link href={`${base}/info`}><TabsTrigger value="info">Informações</TabsTrigger></Link>
          <Link href={`${base}/strategy`}><TabsTrigger value="strategy">Estratégia</TabsTrigger></Link>
          <Link href={`${base}/branding`}><TabsTrigger value="branding">Branding</TabsTrigger></Link>
          <Link href={`${base}/media`}><TabsTrigger value="media">Mídias</TabsTrigger></Link>
          <Link href={`${base}/meetings`}><TabsTrigger value="meetings">Reuniões</TabsTrigger></Link>
          <Link href={`${base}/finance`}><TabsTrigger value="finance">Financeiro</TabsTrigger></Link>
          <Link href={`${base}/reports`}><TabsTrigger value="reports">Relatórios</TabsTrigger></Link>
        </TabsList>
      </Tabs>
      <p className="text-sm opacity-70">Escolha uma aba acima.</p>
    </div>
  );
}
