"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MEDIA_FOLDERS, type MediaFolder, isMediaFolder } from "@/lib/constants/media";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { Download, FileText, FolderOpen, FolderPlus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

/* ------------------------
Tipagem
------------------------ */
interface MediaItem {
  id: string;
  client_id: string;
  folder: string | null;
  subfolder?: string | null;
  title: string | null;
  file_path: string | null;
  created_at: string;
}

interface CustomFolder {
  id: string;
  name: string;
  parent_folder: string;
  created_at: string;
}

/* ------------------------
Página principal
------------------------ */
export default function MediaListPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const clientId = params.id;
  const folderParam = searchParams.get("folder");
  const subfolderParam = searchParams.get("sub");
  const folder: MediaFolder | "" = isMediaFolder(folderParam) ? folderParam : "";

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<CustomFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  /* ------------------------
     Carregar mídias e subpastas
  ------------------------ */
  useEffect(() => {
    async function loadMedia() {
      if (!folder || !clientId) return setItems([]);

      try {
        setLoading(true);
        setError(null);

        const mediaQuery = supabase
          .from("app_media_items")
          .select("*")
          .eq("client_id", clientId)
          .eq("folder", folder)
          .order("created_at", { ascending: false });

        if (subfolderParam) mediaQuery.eq("subfolder", subfolderParam);

        const [{ data: media }, { data: subs }] = await Promise.all([
          mediaQuery,
          supabase
            .from("app_media_folders")
            .select("id, name, parent_folder, created_at")
            .eq("client_id", clientId)
            .eq("parent_folder", subfolderParam || folder)
            .order("created_at", { ascending: true }),
        ]);

        setItems(media ?? []);
        setFolders(subs ?? []);
      } catch (err) {
        console.error("Erro ao carregar mídias:", err);
        setError("Falha ao carregar as mídias.");
      } finally {
        setLoading(false);
      }
    }

    loadMedia();
  }, [folder, subfolderParam, clientId, supabase]);

  /* ------------------------
     Criar nova subpasta
  ------------------------ */
  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return toast.error("Informe o nome da pasta.");

    try {
      const { error } = await supabase.from("app_media_folders").insert({
        client_id: clientId,
        parent_folder: subfolderParam || folder,
        name: newFolderName.trim(),
      });
      if (error) throw error;

      setFolders((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: newFolderName.trim(), parent_folder: folder, created_at: new Date().toISOString() },
      ]);

      toast.success("Pasta criada com sucesso!");
      setOpenModal(false);
      setNewFolderName("");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar pasta.");
    }
  }

  const base = `/clients/${clientId}/media`;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Biblioteca de Mídias</h1>
          <p className="text-sm text-slate-500">
            Gerencie arquivos, pastas e conteúdos enviados do cliente.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(folder || subfolderParam) && (
            <Button variant="outline" onClick={() => setOpenModal(true)} className="rounded-full border-slate-300">
              <FolderPlus className="h-4 w-4 mr-2" /> Nova pasta
            </Button>
          )}
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full">
            <Link href={`${base}/new?folder=${folder}${subfolderParam ? `&sub=${encodeURIComponent(subfolderParam)}` : ""}`}>
              <Plus className="mr-2 h-4 w-4" /> Nova mídia
            </Link>
          </Button>
        </div>
      </header>

      {/* Navegação principal */}
      <div className="flex flex-wrap gap-2">
        {MEDIA_FOLDERS.map(({ value, label }) => {
          const active = folder === value;
          return (
            <Link key={value} href={`${base}?folder=${value}`}>
              <Button
                variant={active ? "default" : "outline"}
                className={cn(
                  "rounded-full px-5 transition-all",
                  active ? "bg-slate-900 text-white shadow" : "border-slate-200 text-slate-600 hover:bg-slate-100"
                )}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                {label}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Subpastas */}
      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 pl-2 border-l-2 border-slate-100">
          {folders.map((f) => (
            <Link key={f.id} href={`${base}?folder=${folder}&sub=${encodeURIComponent(f.name)}`}>
              <Button
                variant="outline"
                className="rounded-xl px-4 text-sm bg-white hover:bg-slate-50 border-slate-200"
              >
                📁 {f.name}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Conteúdo */}
      {loading ? (
        <Card className="p-10 text-center text-slate-500 animate-pulse">Carregando mídias...</Card>
      ) : error ? (
        <Card className="p-6 text-center text-red-600">{error}</Card>
      ) : items.length === 0 ? (
        <Card className="p-6 text-center text-slate-500">Nenhum arquivo encontrado nesta pasta.</Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Modal nova pasta */}
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
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------
Card de mídia
------------------------ */
function MediaCard({ item }: { item: MediaItem }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [publicUrl, setPublicUrl] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    async function getUrl() {
      if (!item.file_path) return;
      try {
        const { data, error } = await supabase.storage.from("media").createSignedUrl(item.file_path, 3600);
        if (error) throw error;
        setPublicUrl(data?.signedUrl ?? "");
      } catch {
        const { data } = supabase.storage.from("media").getPublicUrl(item.file_path);
        setPublicUrl(data?.publicUrl ?? "");
      } finally {
        setLoadingPreview(false);
      }
    }
    getUrl();
  }, [item.file_path, supabase]);

  const isVideo = item.file_path?.match(/\.(mp4|mov|webm)$/i);
  const isImage = item.file_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
        {loadingPreview ? (
          <div className="flex h-full items-center justify-center text-slate-400 animate-pulse">Carregando...</div>
        ) : isVideo ? (
          <video src={publicUrl} controls className="h-full w-full object-cover" />
        ) : isImage ? (
          <Image src={publicUrl} alt={item.title ?? ""} fill className="object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <FileText className="h-8 w-8 mb-1" />
            <span className="text-xs">Sem prévia</span>
          </div>
        )}
      </div>

      <div className="flex flex-col p-3">
        <h3 className="truncate text-sm font-semibold text-slate-900">{item.title ?? "(sem título)"}</h3>
        <p className="text-xs text-slate-500 mt-1">{new Date(item.created_at).toLocaleDateString("pt-BR")}</p>

        <div className="mt-3 flex justify-between">
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
