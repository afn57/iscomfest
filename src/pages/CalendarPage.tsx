import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from '../types'
import { calendarEntries } from '../services/selectors'
import { useCalendarStore } from '../store/useCalendarStore'
import { useTaskStore } from '../store/useTaskStore'
import { PageHeader, Tabs } from '../components/common'
import { MonthView } from '../components/calendar/MonthView'
import { WeekView } from '../components/calendar/WeekView'
import { DayView } from '../components/calendar/DayView'
import { CalendarSidebar } from '../components/calendar/CalendarSidebar'
import { EventModal } from '../components/calendar/EventModal'
import { formatMonthYear, todayKey } from '../utils/date'

type ViewMode = 'month' | 'week' | 'day'

const VIEW_TABS = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
]

export function CalendarPage() {
  const [params, setParams] = useSearchParams()
  const rawView = params.get('view')
  const view: ViewMode = rawView === 'week' || rawView === 'day' ? rawView : 'month'

  const paramDate = params.get('date')
  const [selected, setSelected] = useState(() => paramDate ?? todayKey())
  const [cursor, setCursor] = useState(() => new Date(`${paramDate ?? todayKey()}T00:00:00`))
  const [modalOpen, setModalOpen] = useState(false)
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null)
  const [newDate, setNewDate] = useState(selected)

  const restDays = useCalendarStore((s) => s.restDays)
  const userEvents = useCalendarStore((s) => s.events)
  const tasks = useTaskStore((s) => s.tasks)

  const restDates = useMemo(() => restDays.map((r) => r.date), [restDays])
  const entries = useMemo(() => calendarEntries(userEvents, tasks), [userEvents, tasks])

  const syncParam = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v == null) next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true })
  }

  const selectDate = (key: string) => {
    setSelected(key)
    setCursor(new Date(`${key}T00:00:00`))
    syncParam({ date: key })
  }

  const move = (dir: -1 | 1) => {
    setCursor((c) => {
      const d = new Date(c)
      if (view === 'month') d.setMonth(d.getMonth() + dir)
      else if (view === 'week') d.setDate(d.getDate() + dir * 7)
      else d.setDate(d.getDate() + dir)
      return d
    })
  }

  const openCreate = (dateKey: string) => {
    setActiveEvent(null)
    setNewDate(dateKey)
    setModalOpen(true)
  }

  const openEvent = (event: CalendarEvent) => {
    setActiveEvent(event)
    setNewDate(event.date)
    setModalOpen(true)
  }

  const goToday = () => {
    const key = todayKey()
    selectDate(key)
    setCursor(new Date(`${key}T00:00:00`))
  }

  const periodLabel =
    view === 'month'
      ? formatMonthYear(cursor)
      : view === 'week'
        ? `${cursor.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · minggu berjalan`
        : new Date(`${selected}T00:00:00`).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })

  return (
    <>
      <PageHeader
        title="Calendar"
        description="Lihat deadline, sesi fokus, dan Rest Day dalam satu tampilan mingguan hingga bulanan."
        crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Calendar' }]}
        actions={
          <button
            type="button"
            onClick={() => openCreate(selected)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-[0_6px_20px_-10px_var(--primary)] transition-colors hover:bg-primary-strong"
          >
            <CalendarPlus />
            Jadwal baru
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-3 py-2.5 shadow-card">
        <Tabs items={VIEW_TABS} value={view} onChange={(v) => syncParam({ view: v })} />

        <div className="flex items-center gap-1.5">
          <span className="mr-1 hidden text-[13px] font-medium text-ink-soft sm:inline">{periodLabel}</span>
          <button
            type="button"
            aria-label="Sebelumnya"
            onClick={() => move(-1)}
            className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="h-8 rounded-lg border border-line px-3 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-primary/50 hover:text-primary"
          >
            Hari ini
          </button>
          <button
            type="button"
            aria-label="Berikutnya"
            onClick={() => move(1)}
            className="inline-flex size-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {view === 'month' && (
            <MonthView
              base={cursor}
              entries={entries}
              restDates={restDates}
              selected={selected}
              onSelect={selectDate}
            />
          )}
          {view === 'week' && (
            <WeekView
              base={cursor}
              entries={entries}
              restDates={restDates}
              selected={selected}
              onSelect={selectDate}
            />
          )}
          {view === 'day' && (
            <DayView
              entries={entries}
              restDates={restDates}
              selected={selected}
              onCreate={openCreate}
              onOpenEvent={openEvent}
            />
          )}
        </div>

        <CalendarSidebar
          selected={selected}
          entries={entries}
          restDates={restDates}
          onCreate={openCreate}
          onOpenEvent={openEvent}
        />
      </div>

      <EventModal
        open={modalOpen}
        event={activeEvent}
        defaultDate={newDate}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
