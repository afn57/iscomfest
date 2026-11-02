import type { CalendarEvent } from '../../types'
import { EVENT_META } from '../../services/selectors'
import { cn } from '../../utils/cn'
import { formatLong, minuteOfDayToClock, todayKey } from '../../utils/date'
import { Button, EmptyState } from '../common'
import { CalendarPlus } from 'lucide-react'

interface DayViewProps {
  entries: CalendarEvent[]
  restDates: string[]
  selected: string
  onCreate: (dateKey: string) => void
  onOpenEvent: (event: CalendarEvent) => void
}

export function DayView({ entries, restDates, selected, onCreate, onOpenEvent }: DayViewProps) {
  const list = entries.filter((e) => e.date === selected).sort((a, b) => (a.startMinute ?? 0) - (b.startMinute ?? 0))
  const isRest = restDates.includes(selected)
  const today = todayKey()
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const timed = list.filter((e) => e.startMinute != null)
  const untimed = list.filter((e) => e.startMinute == null)

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h3 className="font-display text-[15px] font-semibold text-ink">{formatLong(selected)}</h3>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            {list.length} aktivitas terjadwal
            {selected === today && <span className="text-primary"> · hari ini</span>}
            {isRest && <span className="text-accent"> · Rest Day</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onCreate(selected)}>
            <CalendarPlus />
            Tambah jadwal
          </Button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="px-5 py-5">
          <EmptyState
            compact
            icon={<CalendarPlus />}
            title="Hari ini masih kosong"
            description="Tambahkan jadwal, atau tandai sebagai Rest Day agar streak tetap terjaga."
          />
        </div>
      ) : (
        <div className="max-h-[30rem] overflow-y-auto px-4 py-3">
          <div className="grid gap-3 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
            <div className="hidden flex-col gap-1 sm:flex">
              {hours.map((h) => (
                <div key={h} className="h-8 text-[10.5px] tabular-nums text-ink-muted">
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              {timed.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onOpenEvent(e)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-surface-2',
                  )}
                >
                  <span className={cn('size-2 shrink-0 rounded-full', EVENT_META[e.type].dot)} />
                  <span className="w-20 shrink-0 text-[12.5px] tabular-nums text-ink-muted">
                    {minuteOfDayToClock(e.startMinute!)}
                    {e.endMinute != null ? `–${minuteOfDayToClock(e.endMinute)}` : ''}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium text-ink">{e.title}</span>
                    {e.note && <span className="block truncate text-[11.5px] text-ink-muted">{e.note}</span>}
                  </span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10.5px] font-medium', EVENT_META[e.type].chip)}>
                    {EVENT_META[e.type].label}
                  </span>
                </button>
              ))}

              {untimed.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => onOpenEvent(e)}
                  className="flex w-full items-center gap-3 rounded-xl border border-dashed border-line px-3 py-2.5 text-left transition-colors hover:border-primary/50"
                >
                  <span className={cn('size-2 shrink-0 rounded-full', EVENT_META[e.type].dot)} />
                  <span className="w-20 shrink-0 text-[12px] text-ink-muted">sepanjang hari</span>
                  <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{e.title}</span>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10.5px] font-medium', EVENT_META[e.type].chip)}>
                    {EVENT_META[e.type].label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
