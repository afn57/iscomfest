import type { FocusSchedule, FocusSession, PomodoroRecord, RestrictedApp } from '../../types'
import { uid } from '../../utils/id'
import { SEED_TASKS } from './tasks'

export const RESTRICTED_APPS: RestrictedApp[] = [
  { id: 'instagram', name: 'Instagram', kind: 'social', host: 'instagram.com' },
  { id: 'tiktok', name: 'TikTok', kind: 'social', host: 'tiktok.com' },
  { id: 'youtube', name: 'YouTube', kind: 'video', host: 'youtube.com' },
  { id: 'facebook', name: 'Facebook', kind: 'social', host: 'facebook.com' },
  { id: 'x', name: 'X (Twitter)', kind: 'social', host: 'x.com' },
  { id: 'reddit', name: 'Reddit', kind: 'forum', host: 'reddit.com' },
]

export const DEFAULT_SCHEDULES: FocusSchedule[] = [
  {
    id: uid('sch'),
    label: 'Pagi belajar',
    startMinute: 7 * 60,
    durationMinutes: 50,
    days: [1, 2, 3, 4, 5],
    enabled: true,
  },
  {
    id: uid('sch'),
    label: 'Sore — tugas kampus',
    startMinute: 16 * 60,
    durationMinutes: 50,
    days: [1, 2, 3, 4],
    enabled: true,
  },
  {
    id: uid('sch'),
    label: 'Malam review',
    startMinute: 20 * 60,
    durationMinutes: 25,
    days: [0, 6],
    enabled: false,
  },
]

const now = new Date()

function hoursAgoIso(hours: number): string {
  return new Date(now.getTime() - hours * 3_600_000).toISOString()
}

export function createSeedFocusSessions(): FocusSession[] {
  const specs: Array<{
    hoursAgo: number
    planned: number
    actual: number
    taskId?: string
    status: 'completed' | 'ended_early'
    dnd: boolean
  }> = [
    { hoursAgo: 3, planned: 50, actual: 50, taskId: 'task_02', status: 'completed', dnd: true },
    { hoursAgo: 6, planned: 25, actual: 25, taskId: 'task_01', status: 'completed', dnd: true },
    { hoursAgo: 9, planned: 25, actual: 18, taskId: 'task_07', status: 'ended_early', dnd: false },
    { hoursAgo: 27, planned: 50, actual: 50, taskId: 'task_09', status: 'completed', dnd: true },
    { hoursAgo: 31, planned: 25, actual: 25, status: 'completed', dnd: true },
    { hoursAgo: 50, planned: 50, actual: 44, taskId: 'task_04', status: 'ended_early', dnd: true },
    { hoursAgo: 53, planned: 25, actual: 25, taskId: 'task_03', status: 'completed', dnd: false },
    { hoursAgo: 74, planned: 50, actual: 50, taskId: 'task_02', status: 'completed', dnd: true },
    { hoursAgo: 78, planned: 25, actual: 25, status: 'completed', dnd: true },
    { hoursAgo: 99, planned: 50, actual: 50, taskId: 'task_08', status: 'completed', dnd: true },
    { hoursAgo: 122, planned: 25, actual: 25, status: 'completed', dnd: true },
    { hoursAgo: 147, planned: 50, actual: 32, taskId: 'task_05', status: 'ended_early', dnd: false },
  ]

  return specs.map((s) => {
    const startedAt = hoursAgoIso(s.hoursAgo)
    const endedAt = new Date(new Date(startedAt).getTime() + s.actual * 60_000).toISOString()
    return {
      id: uid('fs'),
      taskId: s.taskId,
      startedAt,
      endedAt,
      plannedMinutes: s.planned,
      actualMinutes: s.actual,
      status: s.status,
      dnd: s.dnd,
      restrictedAppIds:
        s.dnd && s.taskId ? ['instagram', 'tiktok', 'youtube'] : s.dnd ? ['instagram', 'youtube'] : [],
    }
  })
}

export function createSeedPomodoro(): PomodoroRecord[] {
  const specs: Array<{ hoursAgo: number; phase: PomodoroRecord['phase']; minutes: number; cycle: number; taskId?: string }> = [
    { hoursAgo: 3, phase: 'focus', minutes: 25, cycle: 1, taskId: 'task_02' },
    { hoursAgo: 2.5, phase: 'short_break', minutes: 5, cycle: 1 },
    { hoursAgo: 2.3, phase: 'focus', minutes: 25, cycle: 2, taskId: 'task_02' },
    { hoursAgo: 1.9, phase: 'short_break', minutes: 5, cycle: 2 },
    { hoursAgo: 1.7, phase: 'focus', minutes: 25, cycle: 3, taskId: 'task_01' },
    { hoursAgo: 1.3, phase: 'short_break', minutes: 5, cycle: 3 },
    { hoursAgo: 1.1, phase: 'focus', minutes: 25, cycle: 4, taskId: 'task_01' },
    { hoursAgo: 0.7, phase: 'long_break', minutes: 15, cycle: 4 },
    { hoursAgo: 6, phase: 'focus', minutes: 25, cycle: 1, taskId: 'task_07' },
    { hoursAgo: 5.6, phase: 'short_break', minutes: 5, cycle: 1 },
    { hoursAgo: 5.4, phase: 'focus', minutes: 25, cycle: 2, taskId: 'task_07' },
    { hoursAgo: 30, phase: 'focus', minutes: 25, cycle: 1, taskId: 'task_09' },
    { hoursAgo: 29.5, phase: 'short_break', minutes: 5, cycle: 1 },
    { hoursAgo: 29.3, phase: 'focus', minutes: 25, cycle: 2, taskId: 'task_09' },
  ]

  return specs.map((s) => ({
    id: uid('pom'),
    phase: s.phase,
    minutes: s.minutes,
    completedAt: hoursAgoIso(s.hoursAgo),
    taskId: s.taskId,
    cycleIndex: s.cycle,
    finishedNaturally: true,
  }))
}

export const SEED_RELATED_TASK_ID = SEED_TASKS[1].id
