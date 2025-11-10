import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { can, isOwner } from "@/lib/auth/rbac";
import { getSessionProfile } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/* ----------------------------------------------------------
   🔹 Tipos auxiliares
---------------------------------------------------------- */
interface NewClientPayload {
  name: string;
  plan: string;
  main_channel: string;
  start_date?: string | null;
  account_manager?: string | null;
  monthly_ticket?: number | null;
  billing_day?: number | null;
  payment_method?: string | null;
  payment_status?: string | null;
  last_meeting_at?: string | null;
  next_delivery?: string | null;
  progress?: number | null;
  internal_notes?: string | null;
}

/* ----------------------------------------------------------
   🔹 Server Action — Criação de cliente com tratamento aprimorado
---------------------------------------------------------- */
export async function createClientAction(formData: FormData): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user)
    throw new Error('Sessão expirada. Faça login novamente.');

  const normalize = (value: FormDataEntryValue | null): string | null => {
    return value && String(value).trim() !== '' ? String(value).trim() : null;
  };

  const toNumber = (value: FormDataEntryValue | null): number | null => {
    return value ? Number(value) : null;
  };

  const payload: NewClientPayload = {
    name: String(formData.get('name') ?? '').trim(),
    plan: (formData.get('plan') as string) || 'Gestão',
    main_channel: (formData.get('main_channel') as string) || 'Instagram',
    start_date: normalize(formData.get('start_date')),
    account_manager: normalize(formData.get('account_manager')),
    monthly_ticket: toNumber(formData.get('monthly_ticket')),
    billing_day: toNumber(formData.get('billing_day')),
    payment_method: normalize(formData.get('payment_method')),
    payment_status: normalize(formData.get('payment_status')),
    last_meeting_at: normalize(formData.get('last_meeting_at')),
    next_delivery: normalize(formData.get('next_delivery')),
    progress: toNumber(formData.get('progress')),
    internal_notes: normalize(formData.get('internal_notes')),
  };

  if (!payload.name || payload.name.length < 3)
    throw new Error('Informe um nome válido para o cliente.');

  // 🔹 Encontra a organização ativa do usuário
  const { data: member } = await supabase
    .from('app_members')
    .select('org_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  let orgId = member?.org_id ?? null;

  if (!orgId) {
    const { data: ownerOrg } = await supabase
      .from('app_orgs')
      .select('id')
      .eq('owner_user_id', user.id)
      .maybeSingle();

    orgId = ownerOrg?.id ?? null;
  }

  if (!orgId)
    throw new Error('Não foi possível identificar a organização do usuário.');

  // 🔹 Inserção no Supabase
  const { data, error } = await supabase
    .from('app_clients')
    .insert({
      org_id: orgId,
      name: payload.name,
      plan: payload.plan,
      status: 'new',
      main_channel: payload.main_channel,
      created_by: user.id,
      start_date: payload.start_date,
      account_manager: payload.account_manager,
      monthly_ticket: payload.monthly_ticket,
      billing_day: payload.billing_day,
      payment_method: payload.payment_method,
      payment_status: payload.payment_status,
      last_meeting_at: payload.last_meeting_at,
      next_delivery: payload.next_delivery,
      progress: payload.progress,
      internal_notes: payload.internal_notes,
    })
    .select('id')
    .maybeSingle();

  if (error) {
    console.error('❌ Supabase insert error:', error.message, error.details);
    throw new Error('Erro ao criar cliente. Tente novamente.');
  }

  console.log('✅ Cliente criado com sucesso:', data);
  redirect(`/clients/${data?.id}/info`);
}

/* ----------------------------------------------------------
   🔹 Página — Formulário de criação com UX refinada
---------------------------------------------------------- */
export default async function NewClientPage() {
  const session = await getSessionProfile();

  if (!session.user) redirect('/login');
  if (!can(session.role as 'client' | 'staff' | 'owner', 'staff')) {
    redirect('/unauthorized?from=/clients/new');
  }

  const isOwnerRole = isOwner(session.role);

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card className="p-8 space-y-8 border border-slate-200 shadow-sm rounded-3xl bg-white/95 backdrop-blur">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Cadastrar novo cliente
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Registre um novo cliente e inclua informações contratuais,
            operacionais e financeiras.
          </p>
        </header>

        <form action={createClientAction} className="space-y-8">
          {/* 🔹 Seção: Informações Gerais */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Informações gerais
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="name">Nome do cliente</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Loja do João"
                required
                autoComplete="off"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan">Plano</Label>
                <select
                  title='plan'
                  id="plan"
                  name="plan"
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="Gestão">Gestão</option>
                  <option value="Estrutura">Estrutura</option>
                  <option value="Lançamento">Lançamento</option>
                </select>
              </div>

              <div>
                <Label htmlFor="main_channel">Canal principal</Label>
                <select
                  title='main'
                  id="main_channel"
                  name="main_channel"
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Pinterest">Pinterest</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Data de início</Label>
                <Input type="date" id="start_date" name="start_date" />
              </div>

              <div>
                <Label htmlFor="account_manager">Responsável direto</Label>
                <Input
                  id="account_manager"
                  name="account_manager"
                  placeholder="Ex: Esther Maia"
                />
              </div>
            </div>
          </section>

          {/* 🔹 Seção: Acompanhamento Contratual */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Acompanhamento
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="last_meeting_at">Última reunião</Label>
                <Input type="date" id="last_meeting_at" name="last_meeting_at" />
              </div>

              <div>
                <Label htmlFor="next_delivery">Próxima entrega</Label>
                <Input type="date" id="next_delivery" name="next_delivery" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="progress">% de progresso</Label>
                <Input
                  type="number"
                  id="progress"
                  name="progress"
                  placeholder="0 - 100"
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="internal_notes">Observações internas</Label>
              <Textarea
                id="internal_notes"
                name="internal_notes"
                placeholder="Ex: cliente com alta demanda de revisões mensais..."
              />
            </div>
          </section>

          {/* 🔹 Seção: Gestão Financeira (visível apenas para owner) */}
          {isOwnerRole && (
            <section className="space-y-3 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Gestão financeira
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly_ticket">Ticket mensal (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    id="monthly_ticket"
                    name="monthly_ticket"
                    placeholder="Ex: 1500.00"
                  />
                </div>

                <div>
                  <Label htmlFor="billing_day">Dia de pagamento</Label>
                  <Input
                    type="number"
                    id="billing_day"
                    name="billing_day"
                    placeholder="1 - 31"
                    min={1}
                    max={31}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_method">Forma de pagamento</Label>
                  <select
                    title="payment_method"
                    id="payment_method"
                    name="payment_method"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="payment_status">Status de pagamento</Label>
                  <select
                    title="payment_status"
                    id="payment_status"
                    name="payment_status"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  >
                    <option value="Em aberto">Em aberto</option>
                    <option value="Pago">Pago</option>
                    <option value="Atrasado">Atrasado</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          <div className="pt-3">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-11 rounded-xl transition-all duration-150"
            >
              Criar cliente
            </Button>
          </div>
        </form>

        <p className="text-xs text-slate-400 text-center">
          O cliente será automaticamente vinculado à sua organização.
        </p>
      </Card>
    </div>
  );
}
