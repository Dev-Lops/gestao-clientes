"use client";

import { deleteClientAction } from "@/app/(app)/clients/[id]/delete/actions";
import { Button } from "@/components/ui/button";
import type { ActionResponse } from "@/types/actions";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = confirm(
      `Tem certeza que deseja excluir o cliente "${clientName}"?`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("client_id", clientId);

        const result: ActionResponse = await deleteClientAction(formData);

        if (result.success) {
          toast.success(result.message);
          window.location.href = "/clients";
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Erro inesperado ao excluir cliente.");
      }
    });
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isPending}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
    >
      <Trash2 className="h-4 w-4" />
      {isPending ? "Excluindo..." : "Excluir cliente"}
    </Button>
  );
}
