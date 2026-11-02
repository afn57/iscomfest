import { useEffect } from 'react'
import type { Task } from '../types'
import { DAILY_GOALS } from '../data/mock/gamification'
import { useFocusStore } from '../store/useFocusStore'
import { useNotificationStore } from '../store/useNotificationStore'
import { useProgressStore } from '../store/useProgressStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useTaskStore } from '../store/useTaskStore'
import { deadlineLabel, deadlineUrgency, todayKey } from '../utils/date'

const TICK_MS = 45_000

/**
 * Frontend reminder engine.
 *
 * Runs on an interval inside the browser, derives deadlines from local task
 * data and pushes in-app notifications. No server, no push service — this is
 * a simulation of what a backend-driven notifier would do.
 */
export function useReminderEngine(): void {
  useEffect(() => {
    const tick = () => {
      const settings = useSettingsStore.getState().settings
      const notif = useNotificationStore.getState()
      const tasks = useTaskStore.getState().tasks
      const progress = useProgressStore.getState().progress
      const now = new Date()
      const today = todayKey()

      // 1. Deadlines & overdue
      for (const task of tasks) {
        if (task.status === 'completed') continue
        const urgency = deadlineUrgency(task.deadline, task.status)

        if (urgency === 'overdue' && settings.notifications.overdue) {
          notif.push({
            kind: 'overdue',
            title: 'Tugas terlambat',
            body: `"${task.title}" melewati deadline ${deadlineLabel(task.deadline, task.status)}.`,
            href: '/tasks',
            dedupe: `overdue:${task.id}`,
          })
          continue
        }

        if (urgency === 'critical' && settings.notifications.deadlines) {
          const label = deadlineLabel(task.deadline, task.status)
          notif.push({
            kind: 'deadline',
            title: label === 'Hari ini' ? 'Deadline hari ini' : 'Deadline besok',
            body: `"${task.title}" jatuh tempo ${label.toLowerCase()}.`,
            href: '/tasks',
            dedupe: `critical:${task.id}:${today}`,
          })
        }
      }

      // 2. Streak protection in the evening
      const goalValues =
        progress.goalProgress.find((g) => g.date === today)?.values ?? {}
      const goalsMet = DAILY_GOALS.every((g) => (goalValues[g.id] ?? 0) >= g.target)
      if (
        settings.notifications.streakWarnings &&
        progress.currentStreak >= 3 &&
        now.getHours() >= 20 &&
        !progress.activityDates.includes(today) &&
        !goalsMet
      ) {
        notif.push({
          kind: 'streak',
          title: `Streak ${progress.currentStreak} hari masih terancam`,
          body: 'Satu sesi fokus singkat sebelum tidur sudah cukup untuk hari ini.',
          href: '/focus',
          dedupe: `streak:${today}`,
        })
      }

      // 3. Upcoming focus schedule
      if (settings.notifications.focusReminders) {
        const minuteOfDay = now.getHours() * 60 + now.getMinutes()
        for (const schedule of useFocusStore.getState().schedules) {
          if (!schedule.enabled) continue
          if (!schedule.days.includes(now.getDay())) continue
          const delta = schedule.startMinute - minuteOfDay
          if (delta > 0 && delta <= 30) {
            notif.push({
              kind: 'focus',
              title: `Jadwal "${schedule.label}" segera dimulai`,
              body: `Mulai dalam ${delta} menit · ${schedule.durationMinutes} menit fokus.`,
              href: '/focus',
              dedupe: `sch:${schedule.id}:${today}`,
            })
          }
        }
      }

      // 4. Daily digest (evening recap)
      if (settings.notifications.dailyDigest && now.getHours() >= 21) {
        const focusMinutes = useFocusStore
          .getState()
          .sessions.filter((s) => s.status === 'completed' && s.endedAt.slice(0, 10) === today)
          .reduce((sum, s) => sum + s.actualMinutes, 0)
        const doneToday = tasks.filter((t) => t.completedAt?.slice(0, 10) === today).length
        const waiting = tasks.filter((t) => t.status !== 'completed').length
        notif.push({
          kind: 'system',
          title: 'Ringkasan harian',
          body: `${doneToday} tugas selesai · ${focusMinutes} menit fokus · ${waiting} tugas menunggu.`,
          href: '/dashboard',
          dedupe: `digest:${today}`,
        })
      }
    }

    tick()
    const id = window.setInterval(tick, TICK_MS)
    return () => window.clearInterval(id)
  }, [])
}

/**
 * Automatic Focus Lock candidate: an unfinished task whose deadline is inside
 * the configured auto-lock threshold. Pure frontend heuristic.
 */
export function autoLockCandidate(
  tasks: Task[] = useTaskStore.getState().tasks,
  autoLockEnabled = useSettingsStore.getState().settings.focus.autoLockEnabled,
  autoLockHours = useSettingsStore.getState().settings.focus.autoLockThresholdHours,
) {
  if (!autoLockEnabled) return null

  const thresholdMs = autoLockHours * 3_600_000
  const now = Date.now()
  const candidates = tasks
    .filter(
      (t) =>
        t.status !== 'completed' &&
        new Date(t.deadline).getTime() - now > 0 &&
        new Date(t.deadline).getTime() - now <= thresholdMs,
    )
    .sort((a, b) => a.deadline.localeCompare(b.deadline))

  return candidates[0] ?? null
}
