"use client";

import { inviteStaffAction, updateMemberRoleAction } from "@/app/(app)/admin/members/actions";
import { DeleteMemberButton } from "@/features/admin/components/DeleteMemberButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Clock, Shield, User, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

// 🔹 Mapas de papéis
type Role = "owner" | "staff" | "client" | "guest";

const ROLE_LABEL: Record<Role, string> = {
  owner: "Proprietário",
  staff: "Equipe",
  client: "Cliente",
  guest: "Convidado",
};

const ROLE_DESCRIPTION: Record<Exclude<Role, "guest">, string> = {
  owner: "Acesso total e gestão de permissões",
  staff: "Pode gerenciar clientes e tarefas",
  client: "Acesso restrito à própria área",
};

// 🔹 Fetcher para SWR
const fetcher = (url: string) => fetch(url).then((r) => r.json());

// 🔹 Tipagem do membro
type Member = {
  id: string;
  user_id: string | null;
  role: string | null;
  status: string | null;
  full_name?: string | null;
  email?: string | null;
  created_at: string | null;
  org_id?: string | null;
};

// 🔹 Utilitário de data
function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
}

export default function MembersAdminPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/members", fetcher);
  const [submitting, setSubmitting] = useState(false);

  // 🕒 Carregamento elegante
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
        <Clock className="h-6 w-6 mb-3 animate-spin" />
        Carregando informações...
      </div>
    );

  // 🧨 Erro de carregamento
  if (error || !data?.data)
    return (
      <div className="p-10 text-center text-red-600 font-medium">
        Erro ao carregar membros.
      </div>
    );

  const members: Member[] = data.data;
  const totalByRole = members.reduce<Record<Role, number>>(
    (acc, member) => {
      const role = (member.role as Role) || "client";
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    { owner: 0, staff: 0, client: 0, guest: 0 }
  );

  // 🔹 Envio de convites
  async function handleInvite(formData: FormData) {
    setSubmitting(true);
    try {
      await inviteStaffAction(formData);
      toast.success("Convite enviado com sucesso!");
      mutate(); // atualiza a lista
    } catch {
      toast.error("Erro ao enviar convite.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 md:space-y-10">
      {/* 📨 CONVITE */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5 bg-slate-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900">
            Convidar novo membro
          </h2>
          <p className="text-sm text-slate-500">
            Envie um convite por e-mail para liberar acesso como cliente ou membro da equipe.
          </p>
        </div>

        <form
          action={handleInvite}
          className="grid gap-4 px-6 py-6 sm:grid-cols-2 lg:grid-cols-[2fr_1.4fr_1fr_auto]"
        >
          <div>
            <Label htmlFor="invite-email">E-mail</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              placeholder="pessoa@empresa.com"
              className="border border-slate-300 bg-white"
            />
          </div>

          <div>
            <Label htmlFor="invite-name">Nome (opcional)</Label>
            <Input
              id="invite-name"
              name="full_name"
              placeholder="Nome completo"
              className="border border-slate-300 bg-white"
            />
          </div>

          <div>
            <Label htmlFor="invite-role">Papel</Label>
            <select
              id="invite-role"
              name="role"
              title="Selecionar papel"
              aria-label="Selecionar papel"
              defaultValue="staff"
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="staff">Equipe</option>
              <option value="client">Cliente</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full font-medium bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {submitting ? "Enviando..." : "Enviar convite"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 📊 RESUMO DE ROLES */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(["owner", "staff", "client"] as Role[]).map((roleKey) => {
          const Icon =
            roleKey === "owner" ? Shield : roleKey === "staff" ? Users : User;
          const count = totalByRole[roleKey];
          return (
            <Card
              key={roleKey}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
                    {ROLE_LABEL[roleKey]}
                  </p>
                  <p className="text-3xl font-semibold text-slate-900">{count}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {ROLE_DESCRIPTION[roleKey as Exclude<Role, "guest">]}
                  </p>
                </div>
                <Icon className="w-6 h-6 text-slate-400" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* 👥 LISTA DE MEMBROS */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">
            Membros da organização
          </h2>
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs uppercase tracking-wide"
          >
            {members.length} membro(s)
          </Badge>
        </div>

        {members.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-500 text-center">
            Nenhum membro cadastrado até o momento.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {m.full_name || m.email?.split("@")[0] || "Usuário"}
                  </p>
                  <p className="text-xs text-slate-500">{m.email || "—"}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Desde {formatDate(m.created_at)} • {m.status || "—"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-end md:justify-start">
                  <form
                    action={updateMemberRoleAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="member_id" value={m.id} />
                    <select
                      name="role"
                      title="Alterar papel do membro"
                      aria-label="Alterar papel do membro"
                      defaultValue={m.role || "client"}
                      className={cn(
                        "h-10 min-w-[130px] rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all",
                        "focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <option value="owner">Proprietário</option>
                      <option value="staff">Equipe</option>
                      <option value="client">Cliente</option>
                    </select>
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      className="rounded-full border-slate-300 hover:bg-slate-100 transition-all"
                    >
                      Atualizar
                    </Button>
                  </form>

                  {m.role !== "owner" && (
                    <DeleteMemberButton
                      memberId={m.id}
                      displayName={m.full_name || m.email || "Usuário"}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
