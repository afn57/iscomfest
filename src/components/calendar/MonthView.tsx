import { useMemo } from 'react'
import { Sun } from 'lucide-react'
import type { CalendarEvent } from '../../types'
import { EVENT_META } from '../../services/selectors'
import { cn } from '../../utils/cn'
import { formatMonthYear, todayKey } from '../../utils/date'
import { Tooltip } from '../common'

interface MonthViewProps {
  base: Date
  entries: CalendarEvent[]
  restDates: string[]
  selected: string
  onSelect: (dateKey: string) => void
}

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export function MonthView({ base, entries, restDates, selected, onSelect }: MonthViewProps) {
  const cells = useMemo(() => {
    const first = new Date(base.getFullYear(), base.getMonth(), 1)
    const offset = (first.getDay() + 6) % 7 // Monday first
    const start = new Date(first)
    start.setDate(first.getDate() - offset)
    return Array.from({ length: 42 }, (_, i) => {
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
    return map
  }, [entries])

  const today = todayKey()
  const restSet = new Set(restDates)

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="border-b border-line px-4 py-3">
        <h3 className="font-display text-[15px] font-semibold text-ink">{formatMonthYear(base)}</h3>
      </div>

      <div className="grid grid-cols-7 border-b border-line bg-surface-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="px-2 py-2 text-center text-[11px] font-medium text-ink-muted">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((d) => {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          const inMonth = d.getMonth() === base.getMonth()
          const isToday = key === today
          const isSelected = key === selected
          const isRest = restSet.has(key)
          const dayEntries = byDay.get(key) ?? []

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                'group min-h-[92px] border-b border-r border-line px-2 py-1.5 text-left transition-colors last:border-r-0 hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                !inMonth && 'bg-surface-2/40',
                isSelected && 'ring-2 ring-inset ring-primary',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-full text-[12px] tabular-nums',
                    isToday
                      ? 'bg-primary font-semibold text-white'
                      : inMonth
                        ? 'text-ink-soft'
                        : 'text-ink-muted/60',
                  )}
                >
                  {d.getDate()}
                </span>
                {isRest && (
                  <Tooltip content="Rest Day">
                    <span className="flex size-5 items-center justify-center rounded-md bg-accent-soft text-accent">
                      <Sun className="size-3" />
                    </span>
                  </Tooltip>
                )}
              </div>

              <div className="mt-1 space-y-1">
                {dayEntries.slice(0, 2).map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      'truncate rounded px-1.5 py-0.5 text-[10.5px] font-medium leading-tight',
                      EVENT_META[e.type].chip,
                    )}
                    title={e.title}
                  >
                    {e.startMinute != null && (
                      <span className="opacity-70">
                        {String(Math.floor(e.startMinute / 60)).padStart(2, '0')}:
                        {String(e.startMinute % 60).padStart(2, '0')}{' '}
                      </span>
                    )}
                    {e.title}
                  </div>
                ))}
                {dayEntries.length > 2 && (
                  <div className="px-1.5 text-[10.5px] text-ink-muted">+{dayEntries.length - 2} lagi</div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
