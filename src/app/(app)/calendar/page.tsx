"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/appStore";
import type { ContentCalendarItem } from "@/types/tables";

const EMPTY_EVENTS: ContentCalendarItem[] = [];

function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDate(dateStr: string): string {
  return dateStr.slice(0, 10);
}

function toStableUTC(dateStr: string): string {
  return `${dateStr}T12:00:00.000Z`;
}

type CalendarForm = {
  date: string;
  title: string;
  notes: string;
};

export default function CalendarPage() {
  const supabase = useMemo(() => createClient(), []);

  const setTable = useAppStore((state) => state.setTable);
  const orgId = useAppStore((state) => state.orgId);
  const events =
    useAppStore((state) => state.tables.app_content_calendar as ContentCalendarItem[] | undefined) ??
    EMPTY_EVENTS;

  const [loading, setLoading] = useState<boolean>(() => events.length === 0);
  const [selectedDate, setSelectedDate] = useState<string>(toLocalISODate(new Date()));
  const [open, setOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CalendarForm>({ date: "", title: "", notes: "" });
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;

    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const { data: auth } = await supabase.auth.getUser();
        const user = auth?.user;
        if (!user) {
          toast.error("Sessão expirada.");
          setLoading(false);
          return;
        }

        if (!ignore) {
          setUserId(user.id);
        }

        if (events.length === 0) {
          const { data: rows, error } = await supabase
            .from("app_content_calendar")
            .select("id, org_id, created_by, date, title, notes, channel")
            .eq("org_id", orgId)
            .order("date", { ascending: true });

          if (error) throw error;

          const normalized: ContentCalendarItem[] = (rows ?? []).map((row) => ({
            ...row,
            date: normalizeDate(row.date),
          }));

          if (!ignore) {
            setTable("app_content_calendar", normalized);
          }
        }
      } catch (err) {
        console.error(err);
        if (!ignore) toast.error("Erro ao carregar eventos.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [events.length, orgId, setTable, supabase]);

  const dailyEvents = useMemo(() => {
    return events
      .filter((event) => event.date === selectedDate)
      .sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
  }, [events, selectedDate]);

  const monthGrid = useMemo(() => {
    const base = new Date(selectedDate);
    const year = base.getFullYear();
    const month = base.getMonth();

    const firstDay = new Date(year, month, 1);
    const weekDayOfFirst = firstDay.getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ date: string | null }> = [];

    for (let i = 0; i < weekDayOfFirst; i++) cells.push({ date: null });
    for (let day = 1; day <= lastDay; day++) {
      const d = new Date(year, month, day);
      cells.push({ date: toLocalISODate(d) });
    }

    return cells;
  }, [selectedDate]);

  function openCreate(dateStr: string) {
    setEditingId(null);
    setForm({ date: dateStr, title: "", notes: "" });
    setOpen(true);
  }

  function openEdit(evt: ContentCalendarItem) {
    setEditingId(evt.id);
    setForm({ date: evt.date, title: evt.title ?? "", notes: evt.notes ?? "" });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.date) return toast.error("Preencha título e data.");
    if (!orgId || !userId) return toast.error("Sessão inválida.");

    const payload = {
      id: editingId ?? crypto.randomUUID(),
      org_id: orgId,
      created_by: userId,
      date: toStableUTC(form.date),
      title: form.title,
      notes: form.notes || null,
    };

    const { error } = editingId
      ? await supabase.from("app_content_calendar").update(payload).eq("id", editingId)
      : await supabase.from("app_content_calendar").insert(payload);

    if (error) return toast.error("Erro ao salvar.");

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

    if (error) return toast.error("Erro ao remover.");

    toast.success("Evento removido!");
    setOpen(false);
  }

  return (
    <div className="space-y-8 p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Conteúdo & Agenda
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Calendário editorial</h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Planeje campanhas, organize lançamentos e acompanhe tudo em tempo real.
          </p>
        </div>
        <Button onClick={() => openCreate(toLocalISODate(new Date()))}>Novo evento</Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-6 shadow-sm">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
            {"dom seg ter qua qui sex sáb".split(" ").map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {monthGrid.map((cell, index) => {
              if (!cell.date) {
                return <div key={`empty-${index}`} className="h-14 rounded-xl bg-slate-100" />;
              }

              const hasEvents = events.some((event) => event.date === cell.date);
              const isSelected = selectedDate === cell.date;

              return (
                <button
                  key={cell.date}
                  type="button"
                  onClick={() => setSelectedDate(cell.date!)}
                  className={`h-14 rounded-xl border text-sm transition ${
                    isSelected
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

        <Card className="flex h-full flex-col overflow-hidden shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Eventos do dia</h2>
            <p className="text-sm text-slate-500">
              {new Date(selectedDate).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar evento" : "Novo evento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {editingId && (
              <Button variant="ghost" className="text-red-600" onClick={handleDelete}>
                Remover
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
