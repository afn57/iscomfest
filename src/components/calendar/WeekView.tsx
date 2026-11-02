import { useMemo } from 'react'
import type { CalendarEvent } from '../../types'
import { EVENT_META } from '../../services/selectors'
import { cn } from '../../utils/cn'
import { dayKey, formatMonthYear, todayKey } from '../../utils/date'

interface WeekViewProps {
  base: Date
  entries: CalendarEvent[]
  restDates: string[]
  selected: string
  onSelect: (dateKey: string) => void
}

export function WeekView({ base, entries, restDates, selected, onSelect }: WeekViewProps) {
  const days = useMemo(() => {
    const start = new Date(base)
    const offset = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - offset)
    start.setHours(0, 0, 0, 0)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }, [base])

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of entries) {
      const list = map.get(e.date)
      if (list) list.push(e)
      else map.set(e.date, [e])
    }
    for (const list of map.values()) list.sort((a, b) => (a.startMinute ?? 0) - (b.startMinute ?? 0))
    return map
  }, [entries])

  const today = todayKey()
  const restSet = new Set(restDates)
  const from = days[0]
  const to = days[6]

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h3 className="font-display text-[15px] font-semibold text-ink">
          {from.getDate()}–{to.getDate()} {formatMonthYear(to)}
        </h3>
        <p className="text-[12px] text-ink-muted">Minggu aktif</p>
      </div>

      <div className="grid grid-cols-7 divide-x divide-line">
        {days.map((d) => {
          const key = dayKey(d)
          const isToday = key === today
          const isSelected = key === selected
          const isRest = restSet.has(key)
          const list = byDay.get(key) ?? []

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                'min-h-[15rem] px-2.5 py-3 text-left transition-colors hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isSelected && 'bg-surface-2 ring-2 ring-inset ring-primary',
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-ink-muted">
                    {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                  </div>
                  <div
                    className={cn(
                      'mt-0.5 inline-flex size-6 items-center justify-center rounded-full text-[13px] tabular-nums',
                      isToday ? 'bg-primary font-semibold text-white' : 'text-ink-soft',
                    )}
                  >
                    {d.getDate()}
                  </div>
                </div>
                {isRest && <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-medium text-accent">Rest</span>}
              </div>

              <div className="mt-2 space-y-1">
                {list.length === 0 && <p className="text-[11px] text-ink-muted/70">—</p>}
                {list.slice(0, 4).map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      'rounded border-l-2 px-1.5 py-1 text-[11px] leading-tight',
                      EVENT_META[e.type].chip
                    )}
                    title={e.title}
                  >
                    {e.startMinute != null && (
                      <span className="opacity-70 tabular-nums">
                        {String(Math.floor(e.startMinute / 60)).padStart(2, '0')}:
                        {String(e.startMinute % 60).padStart(2, '0')}{' '}
                      </span>
                    )}
                    <span className="line-clamp-2">{e.title}</span>
                  </div>
                ))}
                {list.length > 4 && (
                  <div className="text-[10.5px] text-ink-muted">+{list.length - 4} lagi</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
