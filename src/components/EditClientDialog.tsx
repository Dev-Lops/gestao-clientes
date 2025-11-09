"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { CreditCard, FileText, ListFilter, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Client = {
  id: string;
  name: string;
  plan?: string;
  status?: string;
  main_channel?: string;
  account_manager?: string;
  payment_status?: string;
  payment_method?: string;
  billing_day?: number;
  monthly_ticket?: number;
  internal_notes?: string;
};

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  client: Client | null;
  onSave: (data: Partial<Client>) => Promise<void>;
}

export function EditClientDialog({ open, setOpen, client, onSave }: Props) {
  const [form, setForm] = useState<Partial<Client>>({});

  useEffect(() => {
    if (client) setForm(client);
  }, [client]);

  const handleChange = (key: keyof Client, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    await onSave(form);
    toast.success("Alterações salvas com sucesso!");
  };

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
          {/* Nome */}
          <div>
            <Label>Nome</Label>
            <Input
              value={form.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 focus:ring-indigo-500"
            />
          </div>

          {/* Plano */}
          <div>
            <Label>Plano</Label>
            <Input
              value={form.plan || ""}
              onChange={(e) => handleChange("plan", e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 focus:ring-indigo-500"
            />
          </div>

          {/* Status */}
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
                <SelectItem value="Novo">Novo</SelectItem>
                <SelectItem value="Em Onboarding">Em Onboarding</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Pausado">Pausado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status de pagamento */}
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

          {/* Gestor */}
          <div>
            <Label>Gestor responsável</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={form.account_manager || ""}
                onChange={(e) => handleChange("account_manager", e.target.value)}
                className="pl-9 bg-white border border-slate-300 text-slate-800 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Método de pagamento */}
          <div>
            <Label>Método de pagamento</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                value={form.payment_method || ""}
                onChange={(e) => handleChange("payment_method", e.target.value)}
                className="pl-9 bg-white border border-slate-300 text-slate-800 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Dia de cobrança */}
          <div>
            <Label>Dia de cobrança</Label>
            <Input
              type="number"
              value={form.billing_day || ""}
              onChange={(e) => handleChange("billing_day", Number(e.target.value))}
              className="bg-white border border-slate-300 text-slate-800 focus:ring-indigo-500"
            />
          </div>

          {/* Ticket mensal */}
          <div>
            <Label>Ticket mensal (R$)</Label>
            <Input
              type="number"
              value={form.monthly_ticket || ""}
              onChange={(e) => handleChange("monthly_ticket", Number(e.target.value))}
              className="bg-white border border-slate-300 text-slate-800 focus:ring-indigo-500"
            />
          </div>

          {/* Notas internas */}
          <div className="sm:col-span-2">
            <Label>Notas internas</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                value={form.internal_notes || ""}
                onChange={(e) => handleChange("internal_notes", e.target.value)}
                className="pl-9 bg-white border border-slate-300 text-slate-800 min-h-[120px] focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <DialogFooter className="mt-8 border-t pt-4 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
