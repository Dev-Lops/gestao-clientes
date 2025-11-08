// app/(app)/admin/members/page.tsx
import { inviteStaffAction, updateMemberRoleAction } from "@/app/(app)/admin/members/actions";
import { DeleteMemberButton } from "@/components/DeleteMemberButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseRole, type Role } from "@/lib/auth/rbac";
import { getSessionProfile } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { Shield, User, Users } from "lucide-react";
import { redirect } from "next/navigation";

// 🔹 Mapas de papéis
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

const ROLE_ICON: Record<Role, React.ElementType> = {
  owner: Shield,
  staff: Users,
  client: User,
  guest: User,
};

// 🔹 Tipos
type MemberRow = {
  id: string;
  user_id: string | null;
  role: string | null;
  status: string | null;
  invited_email: string | null;
  full_name?: string | null;
  created_at: string | null;
  app_clients?: { id: string; name: string | null }[] | null;
};

type SupabaseMembersResponse = {
  data: MemberRow[] | null;
  error: { message?: string } | null;
};

// 🔹 Normalizador
function normalizeMembers(rows?: MemberRow[] | null) {
  if (!rows?.length) return [];

  return rows.map((row) => {
    const displayName =
      row.full_name?.trim() ||
      row.invited_email?.split("@")[0] ||
      "Usuário";

    const email = row.invited_email?.trim() || "—";

    return {
      id: row.id,
      displayName,
      email,
      role: parseRole(row.role ?? "client"),
      clientName: row.app_clients?.[0]?.name ?? null,
      status: row.status || (row.user_id ? "Ativo" : "Convite pendente"),
      createdAt: row.created_at,
    };
  });
}

// 🔹 Formata datas
function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
}

// 🔹 Página principal
export default async function MembersAdminPage() {
  const { supabase, role, orgId } = await getSessionProfile();
  if (role !== "owner") redirect("/");

  // 🔸 Busca sem join no schema auth (apenas tabelas públicas)
  const { data: membersData, error } = (await supabase
    .from("app_members")
    .select(`
      id,
      user_id,
      role,
      status,
      invited_email,
      full_name,
      created_at,
      app_clients (id, name)
    `)
    .eq("org_id", orgId)
    .order("created_at", { ascending: true })) as unknown as SupabaseMembersResponse;

  if (error) {
    console.error("Erro ao carregar membros:", error.message);
    return <p className="text-red-500">Erro ao carregar membros.</p>;
  }

  const members = normalizeMembers(membersData);
  const totalByRole = members.reduce<Record<Role, number>>(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    { owner: 0, staff: 0, client: 0, guest: 0 }
  );

  // 🔸 Renderização
  return (
    <div className="space-y-8 md:space-y-10">
      {/* CONVITE */}
      <Card className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900">
            Convidar novo membro
          </h2>
          <p className="text-sm text-slate-500">
            Envie um convite por e-mail para liberar acesso como cliente ou
            membro da equipe.
          </p>
        </div>

        <form
          action={inviteStaffAction}
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
            />
          </div>
          <div>
            <Label htmlFor="invite-name">Nome (opcional)</Label>
            <Input id="invite-name" name="full_name" placeholder="Nome completo" />
          </div>
          <div>
            <Label htmlFor="invite-role">Papel</Label>
            <select
              id="invite-role"
              name="role"
              title="Selecionar papel"
              aria-label="Selecionar papel"
              defaultValue="staff"
              className="h-11 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="staff">Equipe</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full font-medium">
              Enviar convite
            </Button>
          </div>
        </form>
      </Card>

      {/* RESUMO */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(totalByRole) as Role[])
          .filter((r) => r !== "guest")
          .map((roleKey) => {
            const Icon = ROLE_ICON[roleKey];
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
                    <p className="text-3xl font-semibold text-slate-900">
                      {totalByRole[roleKey]}
                    </p>
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

      {/* LISTA */}
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
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-5"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {member.displayName}
                  </p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                  {member.clientName && (
                    <p className="text-xs text-slate-400">
                      Cliente: {member.clientName}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Desde {formatDate(member.createdAt)} • {member.status}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end md:justify-start">
                  <form
                    action={updateMemberRoleAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="member_id" value={member.id} />
                    <select
                      name="role"
                      title="Alterar papel do membro"
                      aria-label="Alterar papel do membro"
                      defaultValue={member.role}
                      className={cn(
                        "h-10 min-w-[130px] rounded-full border border-slate-200 bg-white",
                        "px-4 text-sm font-medium text-slate-700",
                        "shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-900",
                        "hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {(Object.keys(ROLE_LABEL) as Role[])
                        .filter((r) => r !== "guest")
                        .map((value) => (
                          <option key={value} value={value}>
                            {ROLE_LABEL[value]}
                          </option>
                        ))}
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

                  {member.role !== "owner" && (
                    <DeleteMemberButton
                      memberId={member.id}
                      displayName={member.displayName}
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
