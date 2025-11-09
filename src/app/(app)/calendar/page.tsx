"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useAppStore } from "@/store/appStore";
import type { ContentCalendarItem } from "@/types/tables";

// Ícones (lucide-react)
import { Instagram, Megaphone, Music2, Users2 } from "lucide-react";

const EMPTY_EVENTS: ContentCalendarItem[] = [];

function formatLocal(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function normalizeDate(dateStr: string): string {
  return format(parseISO(dateStr), "yyyy-MM-dd");
}

function toUTC(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return utc.toISOString();
}

type CalendarForm = {
  date: string;
  title: string;
  notes: string;
  channel: string;
};

export default function CalendarPage() {
  const supabase = supabaseBrowser;
  const setTable = useAppStore((state) => state.setTable);
  const orgId = useAppStore((state) => state.orgId);
  const events =
    useAppStore(
      (state) =>
        (state.tables.app_content_calendar as ContentCalendarItem[] | undefined) ??
        EMPTY_EVENTS
    );

  const [loading, setLoading] = useState(() => events.length === 0);
  const [selectedDate, setSelectedDate] = useState(formatLocal(new Date()));
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CalendarForm>({
    date: "",
    title: "",
    notes: "",
    channel: "",
  });
  const [userId, setUserId] = useState<string | null>(null);

  // 🔄 Carregar eventos
  const loadEvents = useMemo(
    () => async () => {
      if (!orgId) return;
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        toast.error("Sessão expirada.");
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data: rows, error } = await supabase
        .from("app_content_calendar")
        .select("id, org_id, created_by, event_date, title, notes, channel, created_at")
        .eq("org_id", orgId)
        .order("event_date", { ascending: true });

      if (error) {
        console.error(error);
        toast.error("Erro ao carregar eventos.");
        setLoading(false);
        return;
      }

      const normalized = (rows ?? []).map((r) => ({
        ...r,
        date: normalizeDate(r.event_date),
      }));

      setTable("app_content_calendar", normalized);
      setLoading(false);
    },
    [orgId, supabase, setTable]
  );

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const dailyEvents = useMemo(() => {
    return events
      .filter((event) => event.date === selectedDate)
      .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  }, [events, selectedDate]);

  const monthGrid = useMemo(() => {
    const base = parseISO(`${selectedDate}T00:00:00`);
    const year = base.getFullYear();
    const month = base.getMonth();
    const firstDay = new Date(year, month, 1);
    const weekDayOfFirst = firstDay.getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ date: string | null }> = [];
    for (let i = 0; i < weekDayOfFirst; i++) cells.push({ date: null });
    for (let day = 1; day <= lastDay; day++) {
      const d = new Date(year, month, day);
      cells.push({ date: formatLocal(d) });
    }
    return cells;
  }, [selectedDate]);

  function openCreate(dateStr: string) {
    setEditingId(null);
    setForm({ date: dateStr, title: "", notes: "", channel: "" });
    setOpen(true);
  }

  function openEdit(evt: ContentCalendarItem) {
    setEditingId(evt.id);
    setForm({
      date: evt.date ?? "",
      title: evt.title ?? "",
      notes: evt.notes ?? "",
      channel: evt.channel ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.date) return toast.error("Preencha título e data.");
    if (!orgId || !userId) return toast.error("Sessão inválida.");
    if (!form.channel) return toast.error("Selecione um canal.");

    const payload = {
      org_id: orgId,
      created_by: userId,
      event_date: toUTC(form.date),
      title: form.title,
      notes: form.notes || null,
      channel: form.channel,
    };

    const { data, error } = editingId
      ? await supabase.from("app_content_calendar").update(payload).eq("id", editingId).select()
      : await supabase.from("app_content_calendar").insert(payload).select();

    if (error) {
      console.error("Erro ao salvar evento:", error);
      toast.error("Erro ao salvar evento.");
      return;
    }

    const newEvent = {
      ...data[0],
      date: normalizeDate(data[0].event_date),
    };

    setTable("app_content_calendar", [
      ...events.filter((e) => e.id !== newEvent.id),
      newEvent,
    ]);

    toast.success(editingId ? "Evento atualizado!" : "Evento criado!");
    setOpen(false);
  }

  async function handleDelete() {
    if (!editingId || !orgId) return;

    const { error } = await supabase
      .from("app_content_calendar")
      .delete()
      .eq("id", editingId)
      .eq("org_id", orgId);

    if (error) return toast.error("Erro ao remover evento.");

    setTable(
      "app_content_calendar",
      events.filter((e) => e.id !== editingId)
    );

    toast.success("Evento removido!");
    setOpen(false);
  }

  return (
    <div className="space-y-8 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Conteúdo & Agenda</p>
          <h1 className="text-3xl font-semibold text-slate-900">Calendário editorial</h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Planeje campanhas, organize lançamentos e acompanhe tudo em tempo real.
          </p>
        </div>
        <Button onClick={() => openCreate(formatLocal(new Date()))}>Novo evento</Button>
      </header>

      {/* 🗓️ Grade mensal */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6 shadow-sm">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
            {"dom seg ter qua qui sex sáb".split(" ").map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {monthGrid.map((cell, index) => {
              if (!cell.date)
                return <div key={`empty-${index}`} className="h-14 rounded-xl bg-slate-100" />;

              const hasEvents = events.some((event) => event.date === cell.date);
              const isSelected = selectedDate === cell.date;

              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setSelectedDate(cell.date!)}
                  className={`h-14 rounded-xl border text-sm transition ${isSelected
                    ? "border-slate-900 bg-slate-900/90 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                >
                  <div className="flex h-full flex-col items-center justify-center gap-1">
                    <span>{Number(cell.date.slice(-2))}</span>
                    {hasEvents && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* 🗒️ Lista diária */}
        <Card className="flex h-full flex-col overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Eventos do dia</h2>
            <p className="text-sm text-slate-500">
              {format(parseISO(selectedDate), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {loading ? (
              <p className="text-sm text-slate-500">Carregando eventos...</p>
            ) : dailyEvents.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhum evento para este dia.</p>
            ) : (
              <AnimatePresence>
                {dailyEvents.map((event) => (
                  <motion.button
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => openEdit(event)}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
                  >
                    <h3 className="font-semibold text-slate-900">{event.title ?? "Sem título"}</h3>
                    {event.channel && (
                      <p className="text-xs text-indigo-600 mt-1 capitalize">{event.channel}</p>
                    )}
                    {event.notes && (
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{event.notes}</p>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        </Card>
      </div>

      {/* 💬 Dialog de criação/edição */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 bg-white shadow-xl border border-slate-200">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar evento" : "Novo evento"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label>Título</Label>
              <Input
                autoFocus
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Postagem, reunião, entrega..."
              />
            </div>
            
            <div>
              <Label>Canal</Label>
              <Select
                value={form.channel}
                onValueChange={(v) => setForm({ ...form, channel: v })}
              >
                <SelectTrigger
                  className="bg-white border border-slate-300 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                  <SelectValue placeholder="Selecione o canal" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-md rounded-xl">
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <Instagram size={16} className="text-pink-600" /> Instagram
                    </div>
                  </SelectItem>
                  <SelectItem value="tiktok">
                    <div className="flex items-center gap-2">
                      <Music2 size={16} className="text-black" /> TikTok
                    </div>
                  </SelectItem>
                  <SelectItem value="reunião">
                    <div className="flex items-center gap-2">
                      <Users2 size={16} className="text-blue-600" /> Reunião
                    </div>
                  </SelectItem>
                  <SelectItem value="campanha">
                    <div className="flex items-center gap-2">
                      <Megaphone size={16} className="text-orange-500" /> Campanha
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>


            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div>
              <Label>Notas</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Anotações, responsáveis, links ou detalhes adicionais"
                className="min-h-[90px]"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between pt-4">
            {editingId && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Excluir
              </Button>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {editingId ? "Salvar alterações" : "Criar evento"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
