import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSessionProfile } from "@/lib/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function InviteClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, role, orgId } = await getSessionProfile();
  if (role !== "owner" && role !== "staff") redirect("/");

  const { id } = await params;

  // 🔍 Busca cliente
  const { data: client } = await supabase
    .from("app_clients")
    .select("id, name, invited_email, member_id")
    .eq("id", id)
    .single();

  if (!client) redirect("/clients");

  // 🔍 Verifica se já existe membro vinculado a este cliente
  const { data: existingMember } = await supabase
    .from("app_members")
    .select("id, invited_email")
    .eq("client_id", client.id)
    .eq("role", "client")
    .maybeSingle();

  const jaTemCliente = !!existingMember;

  // 🧭 Função de convite
  async function inviteClient(formData: FormData) {
    "use server";
    const email = formData.get("email")?.toString().trim();
    const fullName = formData.get("full_name")?.toString().trim() || "Cliente";

    const supabase = await createServerSupabaseClient();

    // 🔸 Cria membro vinculado ao cliente
    const { data: member, error } = await supabase
      .from("app_members")
      .insert({
        org_id: orgId,
        client_id: id, // ✅ vínculo direto
        invited_email: email,
        full_name: fullName,
        role: "client",
        status: "pending",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    // 🔸 Atualiza cliente com vínculo
    await supabase
      .from("app_clients")
      .update({ invited_email: email, member_id: member.id })
      .eq("id", id);

    revalidatePath(`/clients/${id}`);
    redirect(`/clients/${id}/info`);
  }

  return (
    <div className="max-w-lg mx-auto mt-10">
      <Card className="p-6 space-y-4 rounded-3xl border border-slate-200 shadow-sm bg-white">
        <h2 className="text-lg font-semibold text-slate-900">Convidar cliente</h2>
        <p className="text-sm text-slate-500">
          {client.name
            ? `Convide ${client.name} para acessar sua área.`
            : "Informe o e-mail do cliente que poderá acessar esta área."}
        </p>

        {jaTemCliente ? (
          <div className="p-4 text-sm bg-slate-50 border rounded-xl text-slate-600">
            Este cliente já possui um convite ativo para{" "}
            <strong>{existingMember?.invited_email ?? client.invited_email}</strong>.
            Para convidar outro, remova o cliente atual.
          </div>
        ) : (
          <form action={inviteClient} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nome</Label>
              <Input id="full_name" name="full_name" placeholder="Nome do cliente" />
            </div>

            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="cliente@email.com"
              />
            </div>

            <Button type="submit" className="w-full">
              Enviar convite
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
