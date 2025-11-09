import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

// ✅ Tradução centralizada de status do cliente
// — Banco usa valores em minúsculo, UI mostra label em português

export const CLIENT_STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  onboarding: 'Em Onboarding',
  active: 'Ativo',
  paused: 'Pausado',
  closed: 'Encerrado',
}

export function getStatusLabel(status?: string | null): string {
  if (!status) return 'Novo'
  return CLIENT_STATUS_LABELS[status] ?? status
}
