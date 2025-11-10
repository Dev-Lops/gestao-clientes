"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { deleteTask } from "@/app/(app)/clients/[id]/tasks/actions";

export function DeleteTaskButton({
  id,
  clientId,
}: {
  id: string;
  clientId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        🗑
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tem certeza?</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Essa ação não pode ser desfeita.
            </p>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const formData = new FormData();
                  formData.append("id", id);
                  formData.append("clientId", clientId);
                  try {
                    await deleteTask(formData);
                    toast("Tarefa excluída com sucesso!");
                    setOpen(false);
                  } catch {
                    toast("Erro ao excluir tarefa");
                  }
                })
              }
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
