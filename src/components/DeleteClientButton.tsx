"use client";

import { deleteClientAction } from "@/app/(app)/clients/actions";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner"; // se não tiver o sonner, posso adaptar pro shadcn/toast padrão

export function DeleteClientButton({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("client_id", clientId);

        await deleteClientAction(formData);

        toast.success("Cliente excluído com sucesso!");
        setOpen(false);
        router.push("/clients");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro ao excluir cliente.";
        toast.error(message);
        console.error("Erro ao excluir:", err);
      }
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        className="rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all"
        onClick={() => setOpen(true)}
      >
        🗑️ Excluir cliente
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-sm bg-white rounded-2xl shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-slate-900">
              Tem certeza que deseja excluir este cliente?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-600">
              Essa ação é permanente e removerá todos os dados vinculados a este cliente.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex justify-end gap-3 pt-3">
            <AlertDialogCancel
              disabled={isPending}
              className="rounded-full border-slate-300 hover:bg-slate-100"
            >
              Cancelar
            </AlertDialogCancel>

            <Button
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 shadow-sm"
            >
              {isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
