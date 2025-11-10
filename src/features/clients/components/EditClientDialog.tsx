"use client";

import { updateClientInfo } from "@/app/(app)/clients/[id]/info/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResponse } from "@/types/actions";
import type { AppClient } from "@/types/tables"; // ✅ garante tipagem padronizada
import { CLIENT_STATUS_LABELS } from "@/lib/utils/status";
import { CreditCard, FileText, ListFilter, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  client: AppClient | null;
  onSuccess?: () => void;
  onSave?: (updated: Partial<AppClient>) => Promise<void>; // ✅ integração com ClientProfile
}

export function EditClientDialog({
  open,
  setOpen,
  client,
  onSuccess,
  onSave,
}: Props) {
  const [form, setForm] = useState<Partial<AppClient>>({});
  const [saving, setSaving] = useState(false);

  // Quando o modal abre, popula os dados do cliente
  useEffect(() => {
    if (client) setForm(client);
  }, [client]);

  const handleChange = (key: keyof AppClient, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit() {
    if (!form.id) return;
    setSaving(true);
    try {
      if (onSave) {
        // ✅ usa função externa (ClientProfile)
        await onSave(form);
      } else {
        // ✅ fallback interno
        const result: ActionResponse = await updateClientInfo(form);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      }

      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl bg-white border border-slate-200 shadow-xl rounded-2xl p-8">
        <DialogHeader className="border-b pb-4 mb-6">
          <DialogTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-indigo-600" />
            Editar informações de {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label>Nome</Label>
            <Input
              value={form.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-white border border-slate-300 text-slate-800"
            />
          </div>

          <div>
            <Label>Plano</Label>
            <Input
              value={form.plan || ""}
              onChange={(e) => handleChange("plan", e.target.value)}
              className="bg-white border border-slate-300 text-slate-800"
            />
          </div>

          <div>
            <Label>Status do cliente</Label>
            <Select
              value={form.status || ""}
              onValueChange={(v) => handleChange("status", v)}
            >
              <SelectTrigger className="bg-white border border-slate-300 text-slate-800 h-10">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200">
                {Object.entries(CLIENT_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status de pagamento</Label>
            <Select
              value={form.payment_status || ""}
              onValueChange={(v) => handleChange("payment_status", v)}
            >
              <SelectTrigger className="bg-white border border-slate-300 text-slate-800 h-10">
                <SelectValue placeholder="Selecione o status de pagamento" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200">
                <SelectItem value="Em dia">Em dia</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Gestor responsável</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={form.account_manager || ""}
                onChange={(e) =>
                  handleChange("account_manager", e.target.value)
                }
                className="pl-9 bg-white border border-slate-300 text-slate-800"
              />
            </div>
          </div>

          <div>
            <Label>Método de pagamento</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={form.payment_method || ""}
                onChange={(e) => handleChange("payment_method", e.target.value)}
                className="pl-9 bg-white border border-slate-300 text-slate-800"
              />
            </div>
          </div>

          <div>
            <Label>Dia de cobrança</Label>
            <Input
              type="number"
              value={form.billing_day || ""}
              onChange={(e) =>
                handleChange("billing_day", Number(e.target.value))
              }
              className="bg-white border border-slate-300 text-slate-800"
            />
          </div>

          <div>
            <Label>Ticket mensal (R$)</Label>
            <Input
              type="number"
              value={form.monthly_ticket || ""}
              onChange={(e) =>
                handleChange("monthly_ticket", Number(e.target.value))
              }
              className="bg-white border border-slate-300 text-slate-800"
            />
          </div>

          <div className="sm:col-span-2">
            <Label>Notas internas</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                value={form.internal_notes || ""}
                onChange={(e) => handleChange("internal_notes", e.target.value)}
                className="pl-9 bg-white border border-slate-300 text-slate-800 min-h-[120px]"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-8 border-t pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
