"use client";

import { deleteMediaItem } from "@/app/(app)/clients/[id]/media/actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

interface DeleteMediaButtonProps {
  itemId: string;
  clientId: string;
  canDelete?: boolean;
}

export function DeleteMediaButton({
  itemId,
  clientId,
  canDelete = false,
}: DeleteMediaButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!canDelete) {
    return null;
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este arquivo? Essa ação não pode ser desfeita.",
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", itemId);
        formData.append("clientId", clientId);

        await deleteMediaItem(formData);
        toast.success("Arquivo excluído com sucesso!");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Erro ao excluir arquivo.",
        );
      }
    });
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:bg-red-50"
      aria-label="Excluir arquivo"
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </Button>
  );
}
