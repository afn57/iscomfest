import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  formatDistanceToNowStrict,
  isSameDay,
  isSameMonth,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export const id = idLocale

export const dayKey = (d: Date | string): string => {
  const date = typeof d === 'string' ? parseISO(d) : d
  return format(date, 'yyyy-MM-dd')
}

export const todayKey = (): string => dayKey(new Date())

export const parseDay = (key: string): Date => parseISO(`${key}T00:00:00`)

export const nowIso = (): string => new Date().toISOString()

export const formatShort = (d: Date | string): string =>
  format(typeof d === 'string' ? parseISO(d) : d, 'd MMM', { locale: id })

export const formatLong = (d: Date | string): string =>
  format(typeof d === 'string' ? parseISO(d) : d, 'EEEE, d MMMM yyyy', { locale: id })

export const formatTime = (d: Date | string): string =>
  format(typeof d === 'string' ? parseISO(d) : d, 'HH:mm')

export const formatMonthYear = (d: Date): string => format(d, 'MMMM yyyy', { locale: id })

export const relativeFromNow = (iso: string): string =>
  formatDistanceToNowStrict(parseISO(iso), { locale: id, addSuffix: true })

export type DeadlineUrgency = 'overdue' | 'critical' | 'soon' | 'normal' | 'done'

/**
 * Classifies how urgent a deadline is.
 * critical = less than 24h away, soon = within 3 days.
 */
export function deadlineUrgency(iso: string, status: string): DeadlineUrgency {
  if (status === 'completed') return 'done'
  const target = parseISO(iso)
  const diff = differenceInCalendarDays(target, new Date())
  if (diff < 0 || (diff === 0 && target.getTime() < Date.now())) return 'overdue'
  if (diff === 0) return 'critical'
  if (diff === 1) return 'critical'
  if (diff <= 3) return 'soon'
  return 'normal'
}

export function deadlineLabel(iso: string, status: string): string {
  const target = parseISO(iso)
  const urgency = deadlineUrgency(iso, status)
  if (urgency === 'done') return `Selesai ${formatShort(target)}`
  if (isToday(target)) return 'Hari ini'
  if (isTomorrow(target)) return 'Besok'
  if (isYesterday(target)) return 'Kemarin'
  const diff = differenceInCalendarDays(target, new Date())
  if (diff < 0) return `Lewat ${Math.abs(diff)} hari`
  return formatShort(target)
}

export const minutesToLabel = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export const minutesToClock = (total: number): string => {
  const safe = Math.max(0, Math.floor(total))
  const h = Math.floor(safe / 60)
  const m = safe % 60
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}` : `${m}:00`
}

/** Milliseconds → "MM:SS" (or "H:MM:SS" beyond an hour). */
export const msToClock = (ms: number): string => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** 570 -> "09:30" */
export const minuteOfDayToClock = (minute: number): string => {
  const h = Math.floor(minute / 60)
  const m = minute % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const clockToMinuteOfDay = (value: string): number => {
  const [h, m] = value.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export const clampMinutes = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

/** ISO string → value for `<input type="datetime-local">` in local time. */
export const toDatetimeLocal = (iso: string | undefined): string => {
  if (!iso) return ''
  const d = typeof iso === 'string' ? parseISO(iso) : iso
  return `${format(d, "yyyy-MM-dd'T'HH:mm")}`
}

/** Value of `<input type="datetime-local">` → ISO string. */
export const fromDatetimeLocal = (value: string): string => {
  if (!value) return ''
  const d = parseISO(value)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

export {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
}

/** Last `count` calendar days ending today, oldest first. */
export function lastNDays(count: number): Date[] {
  const out: Date[] = []
  const today = new Date()
  for (let i = count - 1; i >= 0; i--) out.push(addDays(today, -i))
  return out
}

/** Mon–Sun week containing `base`. */
export function weekDays(base: Date = new Date()): Date[] {
  const start = startOfWeek(base, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function greetingFor(date: Date = new Date()): string {
  const h = date.getHours()
  if (h < 5) return 'Selamat malam'
  if (h < 12) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export function greetingEmoji(date: Date = new Date()): string {
  const h = date.getHours()
  if (h < 5) return '🌙'
  if (h < 12) return '☀️'
  if (h < 15) return '🌤️'
  if (h < 18) return '🌇'
  return '🌙'
}
