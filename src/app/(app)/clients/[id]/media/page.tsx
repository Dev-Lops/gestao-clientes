"use client";

import { DeleteMediaButton } from "@/components/DeleteMediaButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
<<<<<<< HEAD
import { createBrowserSupabaseClient as createClient } from "@/lib/supabase/client";

import {
  Clock,
  Download,
  FileText,
  FolderOpen,
  FolderPlus,
  Plus,
} from "lucide-react";
=======
import { MEDIA_FOLDERS, type MediaFolder, isMediaFolder } from "@/lib/constants/media";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { Download, FileText, FolderOpen, FolderPlus, Plus, Trash2 } from "lucide-react";
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/* ------------------ Tipos ------------------ */
type MediaItem = {
  id: string;
  title: string | null;
  file_path: string | null;
  folder: string | null;
  subfolder: string | null;
  created_at: string;
};

type MediaFolder = {
  id: string;
  name: string;
  parent_folder: string | null;
  created_at: string;
};

/* ------------------ Página principal ------------------ */
export default function ClientMediaPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const clientId = params.id;
  const folderParam = searchParams.get("folder");
  const subfolderParam = searchParams.get("sub");
  const folder: MediaFolder | "" = isMediaFolder(folderParam) ? folderParam : "";

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  /* ------------------ Buscar mídias ------------------ */
  useEffect(() => {
    async function loadMedia() {
      try {
        setLoading(true);

        const [{ data: media }, { data: subs }] = await Promise.all([
          supabase
            .from("app_media_items")
            .select("*")
            .eq("client_id", clientId)
            .eq("folder", folder)
            .eq("subfolder", subfolder || null)
            .order("created_at", { ascending: false }),
          supabase
            .from("app_media_folders")
            .select("*")
            .eq("client_id", clientId)
            .eq("parent_folder", subfolder || folder)
            .order("created_at", { ascending: true }),
        ]);

        setItems(media ?? []);
        setFolders(subs ?? []);
      } catch (err) {
        console.error("Erro ao carregar mídias:", err);
        toast.error("Erro ao carregar mídias.");
      } finally {
        setLoading(false);
      }
    }

    loadMedia();
  }, [folder, subfolder, clientId, supabase]);

  /* ------------------ Criar pasta ------------------ */
  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return toast.error("Informe o nome da pasta.");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Usuário não autenticado.");
        return;
      }

      // Busca a org vinculada ao owner (precisa vir antes do insert!)
      const { data: org, error: orgError } = await supabase
        .from("app_orgs")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (orgError) {
        console.error("Erro ao buscar organização:", orgError);
        toast.error("Erro ao identificar organização.");
        return;
      }

      const orgId = org?.id ?? null;

      // Agora sim faz o insert corretamente
      const { error } = await supabase.from("app_media_folders").insert({
        client_id: clientId,
        org_id: orgId,
        parent_folder: folder || null,
        name: newFolderName.trim(),
        created_by: user.id, // ⚡ necessário para RLS
      });

      if (error) {
        console.error("Erro Supabase:", error);
        toast.error(error.message || "Erro ao criar pasta.");
        return;
      }

      toast.success("Pasta criada com sucesso!");
      setNewFolderName("");
      setOpenModal(false);
    } catch (err) {
      console.error("Erro ao criar pasta:", err);
      toast.error("Erro inesperado ao criar pasta.");
    }
  }

  /* ------------------ Loading global ------------------ */
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-500">
        <Clock className="h-6 w-6 mb-3 animate-spin" />
        Carregando mídias...
      </div>
    );

  /* ------------------ Layout ------------------ */
  return (
    <div className="max-w-6xl mx-auto p-10 space-y-10 bg-white rounded-3xl shadow-xl border border-slate-200">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FolderOpen className="h-7 w-7 text-indigo-600" />
            Biblioteca de Mídias
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie imagens, vídeos e arquivos de cada cliente.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 border-slate-300"
          >
            <FolderPlus className="h-4 w-4" /> Nova Pasta
          </Button>
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
          >
            <Link
              href={`/clients/${clientId}/media/new?folder=${folder}${subfolder ? `&sub=${subfolder}` : ""
                }`}
            >
              <Plus className="h-4 w-4" /> Nova Mídia
            </Link>
          </Button>
        </div>
      </header>

      {/* Subpastas */}
      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {folders.map((f) => (
            <Link
              key={f.id}
              href={`/clients/${clientId}/media?folder=${folder}&sub=${encodeURIComponent(
                f.name
              )}`}
            >
              <Button
                variant="outline"
                className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-sm"
              >
                📁 {f.name}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Itens */}
      {items.length === 0 ? (
        <Card className="p-10 text-center text-slate-500">
          Nenhum arquivo encontrado nesta pasta.
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Modal criar pasta */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="rounded-2xl p-6 bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle>Criar nova pasta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4 mt-3">
            <Input
              placeholder="Nome da nova pasta"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              required
            />
            <DialogFooter>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------ Card de Mídia ------------------ */
function MediaCard({ item }: { item: MediaItem }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [publicUrl, setPublicUrl] = useState("");
>>>>>>> 66d34b01a64c46676e180dadbedcf691e78156c2
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    async function getUrl() {
      if (!item.file_path) return;
      try {
        const { data, error } = await supabase.storage
          .from("media")
          .createSignedUrl(item.file_path, 3600);
        if (error) throw error;
        setUrl(data?.signedUrl ?? "");
      } catch {
        const { data } = supabase.storage
          .from("media")
          .getPublicUrl(item.file_path);
        setUrl(data?.publicUrl ?? "");
      } finally {
        setLoadingPreview(false);
      }
    }

    getUrl();
  }, [item.file_path, supabase]);

  const isImage = item.file_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo = item.file_path?.match(/\.(mp4|mov|webm)$/i);

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition">
      <div className="relative aspect-[4/5] bg-slate-100">
        {loadingPreview ? (
          <div className="flex h-full items-center justify-center text-slate-400 animate-pulse">
            <Clock className="h-6 w-6 mr-2 animate-spin" /> Carregando...
          </div>
        ) : isImage ? (
          <Image
            src={url}
            alt={item.title ?? ""}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        ) : isVideo ? (
          <video src={url} controls className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            <FileText className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="p-3 flex justify-between items-center">
        <span className="text-sm font-medium truncate">{item.title}</span>
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="hover:bg-slate-100"
          >
            <a href={url} title="download" download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <DeleteMediaButton itemId={item.id} filePath={item.file_path!} />
        </div>
      </div>
    </Card>
  );
}
