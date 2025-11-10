"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Props = {
  clientId: string;
  clientName?: string | null;
  invitedEmail?: string | null;
  memberId?: string | null;
};

export function ClientInviteCard({
  clientId,
  clientName,
  invitedEmail,
  memberId,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const alreadyInvited = Boolean(invitedEmail || memberId);

  async function handleRemoveAccess() {
    if (!confirm("Remover acesso do cliente?")) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/clients/${clientId}/remove-access`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Erro ao remover acesso.");
        toast.success("Acesso do cliente removido com sucesso.");
        window.location.reload();
      } catch (err) {
        console.error(err);
        toast.error("Erro ao remover acesso.");
      }
    });
  }

  return (
    <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Acesso do cliente
          </h2>
          <p className="text-sm text-slate-500">
            Controle quem pode acessar a área deste cliente.
          </p>
        </div>
        {alreadyInvited ? (
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 text-xs uppercase tracking-wide"
          >
            Ativo
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-xs uppercase tracking-wide"
          >
            Sem acesso
          </Badge>
        )}
      </div>

      {alreadyInvited ? (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 border text-sm text-slate-600">
            Cliente já convidado:{" "}
            <strong>{invitedEmail ?? "e-mail não informado"}</strong>.
            <br />
            {clientName && (
              <>
                Acesso vinculado a <strong>{clientName}</strong>.
              </>
            )}
          </div>

          <Button
            onClick={handleRemoveAccess}
            disabled={isPending}
            variant="destructive"
            className="w-full"
          >
            {isPending ? "Removendo..." : "Remover acesso"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Nenhum cliente vinculado ainda. Envie um convite para liberar o
            acesso.
          </p>
          <Link href={`/clients/${clientId}/invite`}>
            <Button className="w-full">Convidar cliente</Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
