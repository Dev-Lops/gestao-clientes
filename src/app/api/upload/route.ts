import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient,
} from "@/lib/supabase/server";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "application/pdf",
  "application/zip",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);
const ALLOWED_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "mp4",
  "mov",
  "webm",
  "pdf",
  "zip",
  "txt",
  "csv",
  "xls",
  "xlsx",
  "doc",
  "docx",
  "ppt",
  "pptx",
]);

function sanitizePathSegment(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const cleaned = trimmed
    .replace(/[\\/]/g, "")
    .replace(/\.+/g, (match) => (match.length > 1 ? "" : "."))
    .slice(0, 80);
  return cleaned || null;
}

function sanitizeFileName(name: string | undefined | null): string {
  const fallback = "arquivo";
  if (!name) return `${fallback}-${Date.now()}`;

  const withoutPath = name.split(/[/\\]/).pop() ?? fallback;
  const normalized = withoutPath
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const cleaned = normalized.replace(/[^a-zA-Z0-9._-]/g, "_");
  const condensed = cleaned.replace(/_{2,}/g, "_");
  const limited = condensed.slice(0, 100);

  return limited || `${fallback}-${Date.now()}`;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const fileEntry = formData.get("file");
    const clientId = sanitizePathSegment(formData.get("clientId"));
    const folder = sanitizePathSegment(formData.get("folder"));
    const subfolder = sanitizePathSegment(formData.get("subfolder"));
    const titleEntry = formData.get("title");

    if (!(fileEntry instanceof File) || !clientId) {
      return NextResponse.json(
        { error: "Arquivo ou cliente inválido." },
        { status: 400 },
      );
    }

    const file = fileEntry;
    const titleSource =
      typeof titleEntry === "string" && titleEntry.trim().length > 0
        ? titleEntry.trim()
        : file.name;
    const title = titleSource.slice(0, 180);

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const maxMb = Math.round((MAX_FILE_SIZE_BYTES / (1024 * 1024)) * 10) / 10;
      return NextResponse.json(
        { error: `Arquivos devem ter até ${maxMb} MB.` },
        { status: 413 },
      );
    }

    const sanitizedFileName = sanitizeFileName(file.name);
    const extension = sanitizedFileName.split(".").pop()?.toLowerCase();

    if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não suportado." },
        { status: 415 },
      );
    }

    if (file.type && file.type !== "" && !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato de arquivo não permitido." },
        { status: 415 },
      );
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

    const { data: client } = await adminClient
      .from("app_clients")
      .select("org_id")
      .eq("id", clientId)
      .maybeSingle();

    if (!client || client.org_id !== member.org_id) {
      return NextResponse.json(
        { error: "Cliente não pertence à sua organização." },
        { status: 403 },
      );
    }

    const pathSegments = [clientId];
    if (folder) pathSegments.push(folder);
    if (subfolder) pathSegments.push(subfolder);
    pathSegments.push(`${randomUUID()}-${sanitizedFileName}`);
    const objectPath = pathSegments.join("/");

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await adminClient.storage
      .from("media")
      .upload(objectPath, fileBuffer, {
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { error: insertError } = await adminClient
      .from("app_media_items")
      .insert({
        client_id: clientId,
        org_id: member.org_id,
        folder: (folder ?? null) as unknown as string,
        subfolder,
        title,
        file_path: objectPath,
        created_by: user.id,
      });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, path: objectPath });
  } catch (err) {
    console.error("❌ Upload error:", err);
    return NextResponse.json(
      { error: "Falha ao fazer upload." },
      { status: 500 },
    );
  }
}
