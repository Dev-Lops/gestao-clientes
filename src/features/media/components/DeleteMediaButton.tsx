"use client";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface DeleteMediaButtonProps {
  itemId: string;
  filePath: string;
}

export function DeleteMediaButton({ itemId, filePath }: DeleteMediaButtonProps) {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // ✅ Checa se o usuário logado é owner (sem cookies do servidor)
  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from("app_members")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsOwner(member?.role === "owner");
    }

    fetchRole();
  }, [supabase]);

  const handleDelete = useCallback(async () => {
    const confirm = window.confirm("Tem certeza que deseja excluir este arquivo?");
    if (!confirm) return;

    if (!isOwner) {
      toast.error("Apenas o proprietário pode excluir arquivos.");
      return;
    }

    setLoading(true);
    try {
      // Excluir do Storage
      const { error: storageErr } = await supabase
        .storage
        .from("media")
        .remove([filePath]);

      if (storageErr) throw storageErr;

      // Excluir registro do banco
      const { error: dbErr } = await supabase
        .from("app_media_items")
        .delete()
        .eq("id", itemId);

      if (dbErr) throw dbErr;

      toast.success("Arquivo excluído com sucesso!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir arquivo.");
    } finally {
      setLoading(false);
    }
  }, [filePath, itemId, isOwner, supabase]);

  return (
    <Button
      size="icon"
      variant="ghost"
      disabled={loading}
      onClick={handleDelete}
      className="hover:bg-red-50 text-red-600"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
