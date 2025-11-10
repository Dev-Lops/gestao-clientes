import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const clientId = formData.get("clientId")?.toString();
    const folder = formData.get("folder")?.toString().trim() || null;
    const subfolder = formData.get("subfolder")?.toString().trim() || null;
    const title =
      formData.get("title")?.toString().trim() || file?.name || "sem_nome";

    if (!file || !clientId) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    const pathSegments = [clientId];
    if (folder) pathSegments.push(folder);
    if (subfolder) pathSegments.push(subfolder);
    pathSegments.push(`${randomUUID()}-${file.name}`);

    const path = pathSegments.join("/");

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: false });

    if (uploadError) throw uploadError;

    const adminClient = createSupabaseServiceRoleClient();

    const { data: member } = await adminClient
      .from("app_members")
      .select("org_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!member?.org_id) {
      return NextResponse.json(
        { error: "Organização não encontrada para o usuário." },
        { status: 403 },
      );
    }

    const { error: insertError } = await adminClient
      .from("app_media_items")
      .insert({
        client_id: clientId,
        org_id: member.org_id,
        folder,
        subfolder,
        title,
        file_path: path,
        created_by: user.id,
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, path });
  } catch (err) {
    console.error("❌ Upload error:", err);
    return NextResponse.json(
      { error: "Falha ao fazer upload." },
      { status: 500 },
    );
  }
}
