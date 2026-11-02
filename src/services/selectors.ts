import { addDays, isSameDay, isToday, parseISO } from 'date-fns'
import type { CalendarEvent, Task } from '../types'
import { DAILY_GOALS } from '../data/mock/gamification'
import { useCalendarStore } from '../store/useCalendarStore'
import { useFocusStore } from '../store/useFocusStore'
import { usePomodoroStore } from '../store/usePomodoroStore'
import { useProgressStore } from '../store/useProgressStore'
import { useTaskStore } from '../store/useTaskStore'
import { dayKey, deadlineUrgency, lastNDays, todayKey } from '../utils/date'
import { compareTasks } from '../utils/priority'

/* --------------------------- Tasks ------------------------------- */

export function todayTasks() {
  return useTaskStore
    .getState()
    .tasks.filter((t) => {
      if (t.status === 'completed') return t.completedAt && isToday(parseISO(t.completedAt))
      return isToday(parseISO(t.deadline))
    })
    .sort(compareTasks)
}

export function openTasks() {
  return useTaskStore
    .getState()
    .tasks.filter((t) => t.status !== 'completed')
    .sort(compareTasks)
}

export function upcomingDeadlines(limit = 5) {
  return openTasks().slice(0, limit)
}

export function overdueTasks() {
  return openTasks().filter((t) => deadlineUrgency(t.deadline, t.status) === 'overdue')
}

export function taskCompletionStats(tasks = useTaskStore.getState().tasks) {
  const total = tasks.length
  const completed = tasks.filter((t) => t.status === 'completed').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const todo = tasks.filter((t) => t.status === 'todo').length
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { total, completed, inProgress, todo, percent }
}

/* --------------------------- Focus ------------------------------- */

export function focusStats() {
  const sessions = useFocusStore.getState().sessions
  const totalMinutes = sessions.reduce((sum, s) => sum + s.actualMinutes, 0)
  const avg = sessions.length === 0 ? 0 : Math.round(totalMinutes / sessions.length)
  const completed = sessions.filter((s) => s.status === 'completed').length
  return {
    sessions: sessions.length,
    totalMinutes,
    avgMinutes: avg,
    completed,
    completionRate: sessions.length === 0 ? 0 : Math.round((completed / sessions.length) * 100),
  }
}

export function focusMinutesOn(date: Date): number {
  return useFocusStore
    .getState()
    .sessions.filter((s) => isSameDay(parseISO(s.endedAt), date))
    .reduce((sum, s) => sum + s.actualMinutes, 0)
}

export function pomodoroFocusToday(): number {
  const today = todayKey()
  return usePomodoroStore
    .getState()
    .records.filter((r) => r.phase === 'focus' && dayKey(r.completedAt) === today)
    .reduce((sum, r) => sum + r.minutes, 0)
}

/* --------------------------- Charts ------------------------------ */

export interface DayPoint {
  date: Date
  label: string
  focusMinutes: number
  tasksDone: number
  pomodoroMinutes: number
}

export function productivitySeries(days = 7): DayPoint[] {
  const tasks = useTaskStore.getState().tasks
  return lastNDays(days).map((date) => {
    const focusMinutes = focusMinutesOn(date)
    const pomodoroMinutes = usePomodoroStore
      .getState()
      .records.filter((r) => r.phase === 'focus' && isSameDay(parseISO(r.completedAt), date))
      .reduce((sum, r) => sum + r.minutes, 0)
    const tasksDone = tasks.filter(
      (t) => t.completedAt && isSameDay(parseISO(t.completedAt), date),
    ).length
    return {
      date,
      label: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      focusMinutes,
      pomodoroMinutes,
      tasksDone,
    }
  })
}

export function statusDistribution() {
  const tasks = useTaskStore.getState().tasks
  return [
    { name: 'To Do', value: tasks.filter((t) => t.status === 'todo').length, key: 'todo' },
    {
      name: 'In Progress',
      value: tasks.filter((t) => t.status === 'in_progress').length,
      key: 'in_progress',
    },
    {
      name: 'Completed',
      value: tasks.filter((t) => t.status === 'completed').length,
      key: 'completed',
    },
  ]
}

/* --------------------------- Calendar ----------------------------- */

/**
 * Merges user-created calendar events with entries derived from tasks so
 * deadlines and completion dates never need to be duplicated by hand.
 */
export function calendarEntries(
  userEvents: CalendarEvent[] = useCalendarStore.getState().events,
  tasks: Task[] = useTaskStore.getState().tasks,
): CalendarEvent[] {
  const derived: CalendarEvent[] = []
  for (const t of tasks) {
    derived.push({
      id: `task-deadline-${t.id}`,
      title: t.title,
      type: t.status === 'completed' ? 'completed' : 'deadline',
      date: dayKey(t.deadline),
      taskId: t.id,
      note: t.category,
    })
    if (t.completedAt) {
      derived.push({
        id: `task-done-${t.id}`,
        title: `${t.title} — selesai`,
        type: 'completed',
        date: dayKey(t.completedAt),
        taskId: t.id,
      })
    }
  }

  return [...userEvents, ...derived]
}

export function entriesForDate(dateKey: string): CalendarEvent[] {
  return calendarEntries()
    .filter((e) => e.date === dateKey)
    .sort((a, b) => (a.startMinute ?? 0) - (b.startMinute ?? 0))
}

export const EVENT_META: Record<
  CalendarEvent['type'],
  { label: string; dot: string; chip: string; text: string }
> = {
  deadline: { label: 'Deadline', dot: 'bg-danger', chip: 'bg-danger-soft text-danger', text: 'text-danger' },
  focus: { label: 'Focus session', dot: 'bg-primary', chip: 'bg-primary-soft text-primary', text: 'text-primary' },
  completed: { label: 'Selesai', dot: 'bg-success', chip: 'bg-success-soft text-success', text: 'text-success' },
  event: { label: 'Jadwal', dot: 'bg-secondary', chip: 'bg-primary-soft text-secondary', text: 'text-secondary' },
  rest: { label: 'Rest Day', dot: 'bg-accent', chip: 'bg-accent-soft text-accent', text: 'text-accent' },
}

/* ------------------------- Gamification -------------------------- */

export function goalSummary() {
  const key = todayKey()
  const values =
    useProgressStore.getState().progress.goalProgress.find((g) => g.date === key)?.values ?? {}
  const items = DAILY_GOALS.map((goal) => {
    const value = values[goal.id] ?? 0
    return {
      goal,
      value,
      met: value >= goal.target,
      percent: Math.min(100, Math.round((value / goal.target) * 100)),
    }
  })
  return {
    items,
    metCount: items.filter((i) => i.met).length,
    total: items.length,
    allMet: items.length > 0 && items.every((i) => i.met),
  }
}

/** Minutes focused on each of the last `days` days, for the heatmap. */
export function focusHeatmap(days = 84): Array<{ date: Date; key: string; minutes: number }> {
  return lastNDays(days).map((date) => ({
    date,
    key: dayKey(date),
    minutes: focusMinutesOn(date),
  }))
}

export function streakWeek() {
  const activity = new Set(useProgressStore.getState().progress.activityDates)
  const rest = new Set(useCalendarStore.getState().restDays.map((r) => r.date))
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, -(6 - i))
    const key = dayKey(date)
    return {
      date,
      key,
      active: activity.has(key),
      rest: rest.has(key),
      isToday: isToday(date),
    }
  })
}
