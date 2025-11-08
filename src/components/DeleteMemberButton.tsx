"use client";

import { deleteMemberAction } from "@/app/(app)/admin/members/actions";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteMemberButton({
  memberId,
  displayName,
}: {
  memberId: string;
  displayName: string;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    if (!confirm(`Excluir ${displayName}? Essa ação é irreversível.`)) return;
    const formData = new FormData();
    formData.append("member_id", memberId);

    startTransition(async () => {
      try {
        await deleteMemberAction(formData);
        toast.success(`Membro ${displayName} excluído com sucesso.`);
      } catch (err) {
        console.error(err);
        toast.error("Falha ao excluir membro.");
      }
    });
  }

  return (
    <Button
      onClick={handleDelete}
      variant="destructive"
      size="sm"
      disabled={isPending}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      {isPending ? "Excluindo..." : "Excluir"}
    </Button>
  );
}
