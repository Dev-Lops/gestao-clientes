"use client";

import { deleteTask } from "@/app/(app)/clients/[id]/tasks/actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteTaskButton({
  id,
  clientId,
}: {
  id: string;
  clientId: string;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", id);
        formData.append("clientId", clientId);
        await deleteTask(formData);
        toast.success("Tarefa removida!");
      } catch (err) {
        toast.error("Erro ao deletar tarefa.");
        console.error(err);
      }
    });
  }

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="sm"
      className="text-slate-500 hover:text-red-600 hover:bg-red-50"
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
