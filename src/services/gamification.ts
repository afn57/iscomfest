import { ACHIEVEMENTS, DAILY_GOALS, levelFromXp, XP_REWARDS, COIN_REWARDS } from '../data/mock/gamification'
import { useCalendarStore } from '../store/useCalendarStore'
import { useFocusStore } from '../store/useFocusStore'
import { useNotificationStore } from '../store/useNotificationStore'
import { usePomodoroStore } from '../store/usePomodoroStore'
import { useProgressStore } from '../store/useProgressStore'
import { useTaskStore } from '../store/useTaskStore'
import type { Achievement, DailyGoal } from '../types'
import { todayKey } from '../utils/date'

export { levelFromXp, DAILY_GOALS, XP_REWARDS, COIN_REWARDS, ACHIEVEMENTS }

export interface GoalStatus {
  goal: DailyGoal
  value: number
  percent: number
  met: boolean
}

export interface AwardResult {
  xp: number
  coins: number
  leveledUp: boolean
  newLevel: number
}

/* ------------------------------------------------------------------ */
/*  Core awards                                                        */
/* ------------------------------------------------------------------ */

export function currentLevel(): number {
  return levelFromXp(useProgressStore.getState().progress.xp).level
}

/** Awards XP, detecting level-ups and unlocking related achievements. */
export function awardXp(amount: number, logMessage?: string): AwardResult {
  const before = levelFromXp(useProgressStore.getState().progress.xp).level
  useProgressStore.getState().addXp(amount)
  const newLevel = levelFromXp(useProgressStore.getState().progress.xp).level
  const leveledUp = newLevel > before

  if (leveledUp) {
    useProgressStore.getState().pushLog({
      type: 'level',
      message: `Naik ke Level ${newLevel}`,
      xp: XP_REWARDS.levelUp,
    })
    useNotificationStore.getState().push({
      kind: 'system',
      title: `Level ${newLevel} tercapai`,
      body: 'Konsistensi kamu terbayar. Teruskan ritmenya.',
      href: '/achievements',
      dedupe: `level:${newLevel}`,
    })
    evaluateAchievements()
  }

  if (logMessage) {
    useProgressStore.getState().pushLog({ type: 'focus', message: logMessage, xp: amount })
  }

  return { xp: amount, coins: 0, leveledUp, newLevel }
}

export function awardCoins(amount: number): void {
  useProgressStore.getState().addCoins(amount)
}

/**
 * Records today as a productive day. Call this only after the user actually
 * *finished* something — never on Start.
 */
export function recordProductiveDay(): void {
  useProgressStore.getState().recordActivity()
  evaluateAchievements()
}

/* ------------------------------------------------------------------ */
/*  Daily goals                                                        */
/* ------------------------------------------------------------------ */

export function todayGoalValues(): Record<string, number> {
  const key = todayKey()
  return (
    useProgressStore.getState().progress.goalProgress.find((g) => g.date === key)?.values ?? {}
  )
}

export function goalStatuses(): GoalStatus[] {
  const values = todayGoalValues()
  return DAILY_GOALS.map((goal) => {
    const value = values[goal.id] ?? 0
    const met = value >= goal.target
    return {
      goal,
      value,
      percent: Math.min(100, Math.round((value / goal.target) * 100)),
      met,
    }
  })
}

export function allGoalsMet(): boolean {
  const statuses = goalStatuses()
  return statuses.length > 0 && statuses.every((s) => s.met)
}

export function goalValue(goalId: string): number {
  return todayGoalValues()[goalId] ?? 0
}

/** Bumps a daily goal counter and pays the bonus once per goal per day. */
export function bumpGoal(goalId: string, delta: number): { justMet: boolean } {
  const key = todayKey()
  useProgressStore.getState().bumpGoalValue(goalId, delta)

  const entry = useProgressStore.getState().progress.goalProgress.find((g) => g.date === key)
  const value = entry?.values[goalId] ?? 0
  const goal = DAILY_GOALS.find((g) => g.id === goalId)
  if (!goal) return { justMet: false }

  const awarded = entry?.awarded ?? []
  if (value < goal.target || awarded.includes(goalId)) return { justMet: false }

  useProgressStore.setState((s) => ({
    progress: {
      ...s.progress,
      goalProgress: s.progress.goalProgress.map((g) =>
        g.date === key ? { ...g, awarded: [...(g.awarded ?? []), goalId] } : g,
      ),
    },
  }))

  awardXp(XP_REWARDS.dailyGoalBonus)
  awardCoins(COIN_REWARDS.dailyGoalBonus)
  useProgressStore.getState().pushLog({
    type: 'goal',
    message: `Mencapai target harian "${goal.label}"`,
    xp: XP_REWARDS.dailyGoalBonus,
  })
  useNotificationStore.getState().push({
    kind: 'streak',
    title: 'Daily goal tercapai',
    body: `"${goal.label}" selesai. +${XP_REWARDS.dailyGoalBonus} XP.`,
    href: '/achievements',
    dedupe: `goal:${goalId}:${key}`,
  })
  evaluateAchievements()
  return { justMet: true }
}

/* ------------------------------------------------------------------ */
/*  Achievements                                                       */
/* ------------------------------------------------------------------ */

function completedTasks() {
  return useTaskStore.getState().tasks.filter((t) => t.status === 'completed')
}

function unlockedIds(): Set<string> {
  return new Set(useProgressStore.getState().progress.unlocked.map((u) => u.id))
}

function isUnlocked(id: string, ctx: AchievementContext): boolean {
  switch (id) {
    case 'first_focus':
      return ctx.focusSessions >= 1
    case 'streak_7':
      return ctx.streak >= 7
    case 'streak_30':
      return ctx.streak >= 30
    case 'focus_10':
      return ctx.focusSessions >= 10
    case 'focus_50':
      return ctx.focusSessions >= 50
    case 'task_25':
      return ctx.completedTasks >= 25
    case 'task_100':
      return ctx.completedTasks >= 100
    case 'pomodoro_50':
      return ctx.pomodoros >= 50
    case 'level_10':
      return ctx.level >= 10
    case 'goal_7':
      return ctx.perfectDays >= 7
    case 'early_bird':
      return ctx.earlyBird
    case 'rest_master':
      return ctx.restDays >= 3
    default:
      return false
  }
}

interface AchievementContext {
  focusSessions: number
  completedTasks: number
  pomodoros: number
  level: number
  streak: number
  perfectDays: number
  earlyBird: boolean
  restDays: number
}

function buildContext(): AchievementContext {
  const tasks = useTaskStore.getState().tasks
  const sessions = useFocusStore.getState().sessions
  const records = usePomodoroStore.getState().records
  const progress = useProgressStore.getState().progress

  const perfectDays = progress.goalProgress.filter((g) =>
    DAILY_GOALS.every((goal) => (g.values[goal.id] ?? 0) >= goal.target),
  ).length

  const earlyBird = completedTasks().some((t) => {
    if (!t.completedAt) return false
    return new Date(t.completedAt).getHours() < 8
  })

  return {
    focusSessions: sessions.length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    pomodoros: records.filter((r) => r.phase === 'focus').length,
    level: levelFromXp(progress.xp).level,
    streak: progress.currentStreak,
    perfectDays,
    earlyBird,
    restDays: useCalendarStore.getState().restDays.length,
  }
}

/** Unlocks anything newly earned. Returns the achievements that were unlocked. */
export function evaluateAchievements(): Achievement[] {
  const ctx = buildContext()
  const have = unlockedIds()
  const fresh: Achievement[] = []
  for (const achievement of ACHIEVEMENTS) {
    if (have.has(achievement.id)) continue
    if (!isUnlocked(achievement.id, ctx)) continue
    if (useProgressStore.getState().unlock(achievement.id)) {
      fresh.push(achievement)
      useProgressStore.getState().pushLog({
        type: 'achievement',
        message: `Membuka achievement "${achievement.name}"`,
      })
      useNotificationStore.getState().push({
        kind: 'achievement',
        title: `Achievement: ${achievement.name}`,
        body: achievement.description,
        href: '/achievements',
        dedupe: `ach:${achievement.id}`,
      })
    }
  }
  return fresh
}

export { completedTasks }
