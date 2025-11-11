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
    .select("id, org_id, invited_email")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return new Response(`Erro ao consultar cliente: ${error.message}`, {
      status: 500,
    });
  }

  if (!client) {
    return new Response("Cliente não encontrado.", { status: 404 });
  }

  if (client.org_id !== session.orgId) {
    return new Response("Não autorizado.", { status: 403 });
  }

  const { error: unlinkError } = await adminClient
    .from("app_client_users")
    .delete()
    .eq("client_id", id);

  if (unlinkError) {
    return new Response(`Erro ao remover vínculo: ${unlinkError.message}`, {
      status: 500,
    });
  }

  const { error: updateError } = await adminClient
    .from("app_clients")
    .update({ invited_email: null })
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
