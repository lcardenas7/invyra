import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

function parseDateInput(date: Date | string): Date {
  if (date instanceof Date) return date

  if (DATE_ONLY_RE.test(date)) {
    const [year, month, day] = date.split("-").map(Number)
    return new Date(year, month - 1, day, 12, 0, 0, 0)
  }

  return new Date(date)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  
  const uniqueId = Math.random().toString(36).substring(2, 8)
  return `${slug}-${uniqueId}`
}

export function formatDate(date: Date | string): string {
  const d = parseDateInput(date)
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(date: Date | string): string {
  const d = parseDateInput(date)
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getTimeRemaining(targetDate: Date | string) {
  const total = parseDateInput(targetDate).getTime() - new Date().getTime()
  
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total }
}

export function combineDateAndTime(datePart: string, timePart: string): Date {
  const [year, month, day] = datePart.split("-").map(Number)
  const [hours = 0, minutes = 0, seconds = 0] = timePart
    .split(":")
    .slice(0, 3)
    .map((value) => parseInt(value, 10) || 0)

  return new Date(year, month - 1, day, hours, minutes, seconds, 0)
}
