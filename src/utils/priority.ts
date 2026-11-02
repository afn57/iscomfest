import type { Priority, TaskStatus } from '../types'

export const PRIORITY_META: Record<
  Priority,
  { label: string; short: string; className: string; dot: string; weight: number }
> = {
  urgent: {
    label: 'Urgent',
    short: 'URG',
    className: 'bg-danger-soft text-danger border-danger/30',
    dot: 'bg-danger',
    weight: 4,
  },
  high: {
    label: 'High',
    short: 'HIGH',
    className: 'bg-warning-soft text-warning border-warning/30',
    dot: 'bg-warning',
    weight: 3,
  },
  medium: {
    label: 'Medium',
    short: 'MED',
    className: 'bg-accent-soft text-accent border-accent/30',
    dot: 'bg-accent',
    weight: 2,
  },
  low: {
    label: 'Low',
    short: 'LOW',
    className: 'bg-primary-soft text-primary border-primary/30',
    dot: 'bg-primary',
    weight: 1,
  },
}

export const STATUS_META: Record<
  TaskStatus,
  { label: string; className: string; dot: string }
> = {
  todo: {
    label: 'To Do',
    className: 'bg-surface-3 text-ink-soft border-line-strong',
    dot: 'bg-ink-muted',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-accent-soft text-accent border-accent/30',
    dot: 'bg-accent',
  },
  completed: {
    label: 'Completed',
    className: 'bg-success-soft text-success border-success/30',
    dot: 'bg-success',
  },
}

export const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low']
export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'completed']

export const FOLDER_COLORS = [
  '#7c5cff',
  '#22d3ee',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#5b8cff',
  '#f472b6',
  '#a3e635',
]

/** Sort by: overdue first, then deadline asc, then priority weight desc. */
export function compareTasks<
  T extends { deadline: string; priority: Priority; status: TaskStatus },
>(a: T, b: T): number {
  const aDone = a.status === 'completed' ? 1 : 0
  const bDone = b.status === 'completed' ? 1 : 0
  if (aDone !== bDone) return aDone - bDone
  const d = a.deadline.localeCompare(b.deadline)
  if (d !== 0) return d
  return PRIORITY_ORDER.indexOf(b.priority) - PRIORITY_ORDER.indexOf(a.priority)
}
