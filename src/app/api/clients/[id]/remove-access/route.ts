import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { getSessionProfile } from "@/services/auth/session";
import { revalidatePath } from "next/cache";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSessionProfile();

  if (!session.user || !session.orgId) {
    return new Response("Não autorizado.", { status: 401 });
  }

  const readerClient = await createSupabaseServerClient();
  const adminClient = createSupabaseServiceRoleClient();

  const { data: client, error } = await readerClient
    .from("app_clients")
    .select("id, member_id")
    .eq("id", id)
    .eq("org_id", session.orgId)
    .maybeSingle();

  if (error) {
    return new Response(`Erro ao consultar cliente: ${error.message}`, {
      status: 500,
    });
  }

  if (!client) {
    return new Response("Cliente não encontrado.", { status: 404 });
  }

  if (client.member_id) {
    const { error: memberError } = await adminClient
      .from("app_members")
      .delete()
      .eq("id", client.member_id)
      .eq("org_id", session.orgId);

    if (memberError) {
      return new Response(`Erro ao remover membro: ${memberError.message}`, {
        status: 500,
      });
    }
  }

  const { error: updateError } = await adminClient
    .from("app_clients")
    .update({ invited_email: null, member_id: null })
    .eq("id", id)
    .eq("org_id", session.orgId);

  if (updateError) {
    return new Response(`Erro ao limpar convite: ${updateError.message}`, {
      status: 500,
    });
  }

  revalidatePath(`/clients/${id}/info`);
  return new Response("Acesso removido.", { status: 200 });
}
