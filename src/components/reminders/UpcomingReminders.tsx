import { useMemo } from 'react'
import { CalendarClock, Clock, Flame, Hourglass, Lock, ScrollText } from 'lucide-react'
import { autoLockCandidate } from '../../services/reminders'
import { deadlineLabel, deadlineUrgency, relativeFromNow, todayKey } from '../../utils/date'
import { useTaskStore } from '../../store/useTaskStore'
import { useFocusStore } from '../../store/useFocusStore'
import { useProgressStore } from '../../store/useProgressStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { cn } from '../../utils/cn'
import { EmptyState, Panel } from '../common'
import { KIND_META } from './notificationMeta'

interface UpcomingItem {
  id: string
  icon: typeof Clock
  tone: string
  title: string
  detail: string
  when: string
  at: number
}

const DAY_MS = 86_400_000

function nextOccurrence(days: number[], startMinute: number): Date | null {
  const now = new Date()
  for (let i = 0; i < 8; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    if (!days.includes(d.getDay())) continue
    d.setHours(Math.floor(startMinute / 60), startMinute % 60, 0, 0)
    if (d.getTime() > now.getTime()) return d
  }
  return null
}

const WEEKDAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function UpcomingReminders() {
  const tasks = useTaskStore((s) => s.tasks)
  const schedules = useFocusStore((s) => s.schedules)
  const progress = useProgressStore((s) => s.progress)
  const settings = useSettingsStore((s) => s.settings)

  const items = useMemo<UpcomingItem[]>(() => {
    const now = Date.now()
    const list: UpcomingItem[] = []

    // 1. Task deadlines
    for (const t of tasks) {
      if (t.status === 'completed') continue
      const at = new Date(t.deadline).getTime()
      if (at < now || at - now > 14 * DAY_MS) continue
      const urgency = deadlineUrgency(t.deadline, t.status)
      list.push({
        id: `deadline-${t.id}`,
        icon: Clock,
        tone: urgency === 'overdue' ? KIND_META.overdue.tone : KIND_META.deadline.tone,
        title: t.title,
        detail: `Deadline ${deadlineLabel(t.deadline, t.status).toLowerCase()} Â· ${t.category}`,
        when: relativeFromNow(t.deadline),
        at,
      })
    }

    // 2. Focus schedules
    if (settings.notifications.focusReminders) {
      for (const s of schedules) {
        if (!s.enabled) continue
        const next = nextOccurrence(s.days, s.startMinute)
        if (!next) continue
        list.push({
          id: `schedule-${s.id}`,
          icon: CalendarClock,
          tone: KIND_META.focus.tone,
          title: s.label,
          detail: `${WEEKDAY_NAMES[s.days[0]] ?? ''} pukul ${String(Math.floor(s.startMinute / 60)).padStart(2, '0')}:${String(s.startMinute % 60).padStart(2, '0')} Â· ${s.durationMinutes} menit`,
          when: `dalam ${relativeFromNow(next.toISOString()).replace(' dari sekarang', '')}`,
          at: next.getTime(),
        })
      }
    }

    // 3. Streak warning window
    if (
      settings.notifications.streakWarnings &&
      progress.currentStreak >= 3 &&
      !progress.activityDates.includes(todayKey())
    ) {
      const t = new Date()
      t.setHours(20, 0, 0, 0)
      if (t.getTime() < now) t.setDate(t.getDate() + 1)
      list.push({
        id: 'streak-window',
        icon: Flame,
        tone: KIND_META.streak.tone,
        title: `Lindungi streak ${progress.currentStreak} hari`,
        detail: 'Pukul 20.00 — satu sesi fokus singkat sudah cukup untuk hari ini.',
        when: 'malam ini',
        at: t.getTime(),
      })
    }

    // 4. Daily digest
    if (settings.notifications.dailyDigest) {
      const t = new Date()
      t.setHours(21, 0, 0, 0)
      if (t.getTime() < now) t.setDate(t.getDate() + 1)
      list.push({
        id: 'daily-digest',
        icon: ScrollText,
        tone: KIND_META.system.tone,
        title: 'Ringkasan harian',
        detail: 'Rekap tugas, menit fokus, dan progres goal hari ini.',
        when: 'malam ini',
        at: t.getTime(),
      })
    }

    // 5. Auto-lock candidate
    const lockTarget = autoLockCandidate(
      tasks,
      settings.focus.autoLockEnabled,
      settings.focus.autoLockThresholdHours,
    )
    if (lockTarget) {
      list.push({
        id: 'autolock',
        icon: Lock,
        tone: KIND_META.deadline.tone,
        title: `Focus Lock disarankan: ${lockTarget.title}`,
        detail: `Tenggat kurang dari ${settings.focus.autoLockThresholdHours} jam lagi.`,
        when: relativeFromNow(lockTarget.deadline),
        at: new Date(lockTarget.deadline).getTime(),
      })
    }

    return list.sort((a, b) => a.at - b.at).slice(0, 8)
  }, [tasks, schedules, progress, settings])

  const isEmpty = items.length === 0

  return (
    <Panel
      title="Pengingat yang akan datang"
      description="Diturunkan dari tugas, jadwal fokus, dan preferensi notifikasi kamu."
      padding="none"
    >
      {isEmpty ? (
        <div className="px-5 pb-5">
          <EmptyState
            compact
            icon={<Hourglass />}
            title="Tidak ada pengingat dalam 14 hari"
            description="Semua tugas jauh dan tidak ada jadwal fokus terdekat."
          />
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', item.tone)}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-ink">{item.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">{item.detail}</p>
                </div>
                <span className="shrink-0 rounded-full bg-surface-3 px-2.5 py-1 text-[11.5px] font-medium text-ink-soft tabular-nums">
                  {item.when}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
