"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type EditableClient = {
  id: string;
  name: string;
  status: string;
  plan: string | null;
  account_manager: string | null;
  payment_status: string | null;
  main_channel: string | null;
};

interface EditClientProps {
  client: EditableClient;
  onUpdated: () => void;
}

export function EditClient({ client, onUpdated }: EditClientProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<EditableClient>(client);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await fetch("/api/client/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Cliente atualizado!");
        setOpen(false);
        onUpdated();
      } else {
        toast.error("Erro ao salvar.");
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="rounded-full bg-indigo-600 text-white">✏️ Editar</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Editar informações</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={formData.plan || ""}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              placeholder="Plano"
            />
            <Input
              value={formData.account_manager || ""}
              onChange={(e) => setFormData({ ...formData, account_manager: e.target.value })}
              placeholder="Responsável"
            />
            <Input
              value={formData.payment_status || ""}
              onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
              placeholder="Status do pagamento"
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
