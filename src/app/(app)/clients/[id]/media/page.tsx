"use client";

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
import { DeleteMediaButton } from "@/features/media/components/DeleteMediaButton";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Clock,
  Download,
  FileText,
  FolderOpen,
  FolderPlus,
  Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type MediaItem = {
  id: string;
  title: string | null;
  file_path: string | null;
  folder: string | null;
  subfolder: string | null;
  created_at: string | null;
};

type MediaFolder = {
  id: string;
  name: string;
  parent_folder: string | null;
  created_at: string | null;
  client_id: string | null; // ✅ corrigido
  org_id?: string | null;
  created_by?: string | null;
  owner_user_id?: string | null;
};

export default function ClientMediaPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const clientId = params.id;
  const folder = searchParams.get("folder") ?? "";
  const subfolder = searchParams.get("sub") ?? "";

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [sessionInfo, setSessionInfo] = useState<{
    orgId: string | null;
    role: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/session", {
          credentials: "include",
        });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          orgId: string | null;
          role: string | null;
        };
        if (!cancelled) {
          setSessionInfo(data);
        }
      } catch {
        // ignora: fallback para RLS
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const mediaQuery = (() => {
          let query = supabase
            .from("app_media_items")
            .select("*")
            .eq("client_id", clientId)
            .order("created_at", { ascending: false });

          if (folder) {
            query = query.eq("folder", folder);
          } else {
            query = query.is("folder", null);
          }

          if (subfolder) {
            query = query.eq("subfolder", subfolder);
          } else {
            query = query.is("subfolder", null);
          }

          return query;
        })();

        const folderQuery = (() => {
          let query = supabase
            .from("app_media_folders")
            .select("*")
            .eq("client_id", clientId)
            .order("created_at", { ascending: true });

          if (subfolder) {
            query = query.eq("parent_folder", subfolder);
          } else if (folder) {
            query = query.eq("parent_folder", folder);
          } else {
            query = query.is("parent_folder", null);
          }

          return query;
        })();

        const [mediaResult, folderResult] = await Promise.all([
          mediaQuery,
          folderQuery,
        ]);

        if (mediaResult.error) {
          throw mediaResult.error;
        }

        if (folderResult.error) {
          throw folderResult.error;
        }

        if (!cancelled) {
          setItems(mediaResult.data ?? []);
          setFolders(folderResult.data ?? []);
        }
      } catch (error) {
        console.error("Erro ao carregar mídias:", error);
        if (!cancelled) {
          toast.error("Erro ao carregar mídias.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (clientId) {
      void load();
    }

    return () => {
      cancelled = true;
    };
  }, [clientId, folder, subfolder, supabase]);

  async function handleCreateFolder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newFolderName.trim()) {
      toast.error("Informe o nome da pasta.");
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Usuário não autenticado.");
        return;
      }

      const orgId = sessionInfo?.orgId;
      if (!orgId) {
        toast.error("Erro ao identificar organização.");
        return;
      }

      const parentFolder = subfolder || folder || null;
      const { data, error } = await supabase
        .from("app_media_folders")
        .insert({
          client_id: clientId,
          org_id: orgId,
          parent_folder: parentFolder,
          name: newFolderName.trim(),
          created_by: user.id,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      toast.success("Pasta criada com sucesso!");
      setNewFolderName("");
      setOpenModal(false);
      setFolders((previous) => (data ? [...previous, data] : previous));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar pasta.",
      );
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-slate-500">
        <Clock className="mb-3 h-6 w-6 animate-spin" />
        Carregando mídias...
      </div>
    );
  }

  const newMediaParams = new URLSearchParams({ folder });
  if (subfolder) {
    newMediaParams.set("sub", subfolder);
  }

  const canManageFiles = sessionInfo?.role === "owner";

  return (
    <div className="mx-auto max-w-6xl space-y-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
            <FolderOpen className="h-7 w-7 text-indigo-600" />
            Biblioteca de Mídias
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie imagens, vídeos e arquivos de cada cliente.
          </p>
        </div>

        {canManageFiles ? (
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
              className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Link
                href={`/clients/${clientId}/media/new?${newMediaParams.toString()}`}
              >
                <Plus className="h-4 w-4" /> Nova Mídia
              </Link>
            </Button>
          </div>
        ) : null}
      </header>

      {folders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {folders.map((folderRow) => {
            const params = new URLSearchParams();

            if (!folder) {
              params.set("folder", folderRow.name);
            } else {
              params.set("folder", folder);
              params.set("sub", folderRow.name);
            }

            return (
              <Link
                key={folderRow.id}
                href={`/clients/${clientId}/media?${params.toString()}`}
              >
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-200 bg-white text-sm hover:bg-slate-50"
                >
                  📁 {folderRow.name}
                </Button>
              </Link>
            );
          })}
        </div>
      )}

      {items.length === 0 ? (
        <Card className="p-10 text-center text-slate-500">
          Nenhum arquivo encontrado nesta pasta.
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              clientId={clientId}
              canDelete={canManageFiles}
            />
          ))}
        </div>
      )}

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="rounded-2xl border-slate-200 bg-white p-6">
          <DialogHeader>
            <DialogTitle>Criar nova pasta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="mt-3 space-y-4">
            <Input
              placeholder="Nome da nova pasta"
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              required
            />
            <DialogFooter>
              <Button
                type="submit"
                className="bg-indigo-600 text-white hover:bg-indigo-700"
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

function MediaCard({
  item,
  clientId,
  canDelete,
}: {
  item: MediaItem;
  clientId: string;
  canDelete: boolean;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [url, setUrl] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUrl() {
      if (!item.file_path) {
        setUrl("");
        setLoadingPreview(false);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from("media")
          .createSignedUrl(item.file_path, 3600);

        if (error) {
          throw error;
        }

        if (!cancelled) {
          setUrl(data?.signedUrl ?? "");
        }
      } catch {
        const { data } = supabase.storage
          .from("media")
          .getPublicUrl(item.file_path);
        if (!cancelled) {
          setUrl(data.publicUrl ?? "");
        }
      } finally {
        if (!cancelled) {
          setLoadingPreview(false);
        }
      }
    }

    void loadUrl();

    return () => {
      cancelled = true;
    };
  }, [item.file_path, supabase]);

  const isImage = item.file_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo = item.file_path?.match(/\.(mp4|mov|webm)$/i);

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/5] bg-slate-100">
        {loadingPreview ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Clock className="mr-2 h-6 w-6 animate-spin" /> Carregando...
          </div>
        ) : isImage ? (
          <Image
            src={url}
            alt={item.title ?? "Arquivo"}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        ) : isVideo ? (
          <video src={url} controls className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">
            <FileText className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-3">
        <span className="truncate text-sm font-medium">{item.title}</span>
        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="hover:bg-slate-100"
            disabled={!url}
          >
            <a href={url || undefined} title="download" download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
          {item.file_path ? (
            <DeleteMediaButton
              itemId={item.id}
              clientId={clientId}
              canDelete={canDelete}
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}
