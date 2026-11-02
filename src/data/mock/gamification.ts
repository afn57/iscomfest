import type {
  Achievement,
  ActivityLogEntry,
  DailyGoal,
  DailyGoalProgress,
  Progress,
  RestDay,
  UnlockedAchievement,
} from '../../types'
import { addDays } from 'date-fns'
import { dayKey } from '../../utils/date'
import { uid } from '../../utils/id'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_focus',
    name: 'First Focus',
    description: 'Selesaikan sesi Focus Mode pertama kamu.',
    icon: 'Target',
    tier: 'bronze',
    requirement: '1 focus session',
  },
  {
    id: 'streak_7',
    name: 'Week of Focus',
    description: 'Pertahankan streak selama 7 hari berturut-turut.',
    icon: 'Flame',
    tier: 'bronze',
    requirement: '7-day streak',
  },
  {
    id: 'streak_30',
    name: 'Monthly Mastery',
    description: 'Pertahankan streak selama 30 hari berturut-turut.',
    icon: 'FlameKindling',
    tier: 'gold',
    requirement: '30-day streak',
  },
  {
    id: 'focus_10',
    name: 'Deep Worker',
    description: 'Selesaikan 10 sesi Focus Mode.',
    icon: 'Brain',
    tier: 'silver',
    requirement: '10 focus sessions',
  },
  {
    id: 'focus_50',
    name: 'Flow State',
    description: 'Selesaikan 50 sesi Focus Mode.',
    icon: 'Crosshair',
    tier: 'gold',
    requirement: '50 focus sessions',
  },
  {
    id: 'task_25',
    name: 'Task Slayer',
    description: 'Tandai 25 tugas sebagai Completed.',
    icon: 'ListChecks',
    tier: 'silver',
    requirement: '25 completed tasks',
  },
  {
    id: 'task_100',
    name: 'Century of Tasks',
    description: 'Tandai 100 tugas sebagai Completed.',
    icon: 'Trophy',
    tier: 'gold',
    requirement: '100 completed tasks',
  },
  {
    id: 'pomodoro_50',
    name: 'Pomodoro Pro',
    description: 'Selesaikan 50 sesi Pomodoro.',
    icon: 'Timer',
    tier: 'silver',
    requirement: '50 pomodoro sessions',
  },
  {
    id: 'level_10',
    name: 'Double Digits',
    description: 'Capai Level 10.',
    icon: 'Zap',
    tier: 'silver',
    requirement: 'Reach level 10',
  },
  {
    id: 'goal_7',
    name: 'Goal Getter',
    description: 'Capai seluruh daily goal selama 7 hari.',
    icon: 'Goal',
    tier: 'silver',
    requirement: '7 perfect goal days',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Selesaikan satu tugas sebelum pukul 08.00.',
    icon: 'Sunrise',
    tier: 'bronze',
    requirement: 'Task done before 08:00',
  },
  {
    id: 'rest_master',
    name: 'Perfectly Balanced',
    description: 'Jadwalkan 3 Rest Day tanpa merasa bersalah.',
    icon: 'Leaf',
    tier: 'bronze',
    requirement: '3 scheduled rest days',
  },
]

export const DAILY_GOALS: DailyGoal[] = [
  { id: 'focus_minutes', label: 'Focus time', target: 120, unit: 'minutes' },
  { id: 'tasks_done', label: 'Tugas selesai', target: 3, unit: 'tasks' },
  { id: 'pomodoro_sessions', label: 'Sesi Pomodoro', target: 4, unit: 'sessions' },
  { id: 'focus_sessions', label: 'Sesi fokus', target: 3, unit: 'sessions' },
]

/* ------------------------------------------------------------------ */
/*  XP curve                                                           */
/* ------------------------------------------------------------------ */

/** XP required to *reach* the given level (level 1 = 0 XP). */
export function xpToReachLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) total += 100 + (i - 1) * 40
  return total
}

export interface LevelInfo {
  level: number
  into: number
  needed: number
  percent: number
  total: number
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1
  while (xpToReachLevel(level + 1) <= xp && level < 999) level++
  const base = xpToReachLevel(level)
  const next = xpToReachLevel(level + 1)
  const needed = next - base
  const into = xp - base
  return {
    level,
    into,
    needed,
    percent: needed <= 0 ? 100 : Math.min(100, Math.round((into / needed) * 100)),
    total: xp,
  }
}

export const XP_REWARDS = {
  focusSession: 25,
  focusSessionEarlyEnd: 10,
  taskCompleted: 40,
  pomodoroSession: 15,
  dailyGoalBonus: 60,
  levelUp: 100,
} as const

export const COIN_REWARDS = {
  focusSession: 6,
  taskCompleted: 12,
  pomodoroSession: 4,
  dailyGoalBonus: 25,
} as const

/* ------------------------------------------------------------------ */
/*  Seed helpers                                                       */
/* ------------------------------------------------------------------ */

function activityDatesSeed(): string[] {
  const keys: string[] = []
  // Earlier run: 21 consecutive days, 30–50 days ago (longest streak)
  for (let i = 50; i >= 30; i--) keys.push(dayKey(addDays(new Date(), -i)))
  // Current run: 12 consecutive days up to today (current streak)
  for (let i = 11; i >= 0; i--) keys.push(dayKey(addDays(new Date(), -i)))
  return keys
}

const UNLOCKED_SEED: UnlockedAchievement[] = [
  'first_focus',
  'streak_7',
  'focus_10',
  'task_25',
  'pomodoro_50',
  'level_10',
  'early_bird',
].map((id, i) => ({
  id,
  unlockedAt: addDays(new Date(), -(24 - i * 3)).toISOString(),
}))

function goalProgressSeed(): DailyGoalProgress[] {
  const out: DailyGoalProgress[] = []
  const today = new Date()
  for (let back = 6; back >= 0; back--) {
    const key = dayKey(addDays(today, -back))
    if (back === 0) {
      out.push({
        date: key,
        values: { focus_minutes: 85, tasks_done: 1, pomodoro_sessions: 2, focus_sessions: 2 },
      })
    } else if (back === 3) {
      // A lighter day — shows the goals are not fake-perfect
      out.push({
        date: key,
        values: { focus_minutes: 40, tasks_done: 1, pomodoro_sessions: 1, focus_sessions: 1 },
      })
    } else {
      out.push({
        date: key,
        values: { focus_minutes: 150, tasks_done: 3, pomodoro_sessions: 5, focus_sessions: 4 },
      })
    }
  }
  return out
}

function logSeed(): ActivityLogEntry[] {
  const now = new Date()
  const at = (hoursAgo: number): string => new Date(now.getTime() - hoursAgo * 3_600_000).toISOString()
  return [
    {
      id: uid('log'),
      type: 'focus',
      message: 'Menyelesaikan sesi fokus 50 menit untuk Tugas Besar Algoritma',
      xp: XP_REWARDS.focusSession,
      at: at(2),
    },
    {
      id: uid('log'),
      type: 'task',
      message: 'Menyelesaikan "Catatan Kuliah Statistika — Bab 3"',
      xp: XP_REWARDS.taskCompleted,
      at: at(5),
    },
    {
      id: uid('log'),
      type: 'goal',
      message: 'Mencapai target focus time harian',
      xp: XP_REWARDS.dailyGoalBonus,
      at: at(7),
    },
    {
      id: uid('log'),
      type: 'pomodoro',
      message: 'Menyelesaikan 4 sesi Pomodoro berturut-turut',
      xp: XP_REWARDS.pomodoroSession * 2,
      at: at(9),
    },
    {
      id: uid('log'),
      type: 'achievement',
      message: 'Membuka achievement "Pomodoro Pro"',
      at: at(26),
    },
    {
      id: uid('log'),
      type: 'reward',
      message: 'Menukarkan 450 coins untuk Exclusive Avatar',
      at: at(30),
    },
    {
      id: uid('log'),
      type: 'focus',
      message: 'Sesi fokus 25 menit dengan Do Not Disturb aktif',
      xp: XP_REWARDS.focusSession,
      at: at(49),
    },
    {
      id: uid('log'),
      type: 'task',
      message: 'Menyelesaikan "Ikut Sesi Mentoring Alumni"',
      xp: XP_REWARDS.taskCompleted,
      at: at(52),
    },
  ]
}

export function createSeedProgress(): Progress {
  return {
    xp: 5_420,
    coins: 1_250,
    activityDates: activityDatesSeed(),
    currentStreak: 12,
    longestStreak: 21,
    unlocked: UNLOCKED_SEED,
    goalProgress: goalProgressSeed(),
    log: logSeed(),
  }
}

export function createSeedRestDays(): RestDay[] {
  const today = new Date()
  return [
    { id: uid('rest'), date: dayKey(addDays(today, -8)), reason: 'Recovery setelah minggu ujian.' },
    { id: uid('rest'), date: dayKey(addDays(today, 5)), reason: 'Hari istirahat terjadwal.' },
  ]
}
