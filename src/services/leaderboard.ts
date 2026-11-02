import { LEADERBOARD_USERS, leaderboardSnapshot } from '../data/mock/social'
import { useProfileStore } from '../store/useProfileStore'
import { useProgressStore } from '../store/useProgressStore'
import { useFocusStore } from '../store/useFocusStore'
import { goalSummary } from './selectors'
import type { LeaderboardMetric, LeaderboardUser } from '../types'

export const METRIC_META: Record<
  LeaderboardMetric,
  { label: string; short: string; unit: string; field: keyof LeaderboardUser }
> = {
  daily: { label: 'Skor hari ini', short: 'Harian', unit: 'poin', field: 'dailyScore' },
  xp: { label: 'Total XP', short: 'XP', unit: 'XP', field: 'xp' },
  focus: { label: 'Total fokus', short: 'Fokus', unit: 'mnt', field: 'focusMinutes' },
  streak: { label: 'Streak', short: 'Streak', unit: 'hari', field: 'streak' },
}

/**
 * Daily score: 60% dari daily goal yang tercapai + 40% dari streak.
 * Angka murni turunan dari data lokal, bukan nilai acak.
 */
export function selfDailyScore(): number {
  const goals = goalSummary()
  const goalPart = goals.total === 0 ? 0 : (goals.metCount / goals.total) * 60
  const streak = useProgressStore.getState().progress.currentStreak
  return Math.min(100, Math.round(goalPart + Math.min(streak / 30, 1) * 40))
}

export function selfFocusMinutes(): number {
  return useFocusStore
    .getState()
    .sessions.reduce((sum, s) => sum + s.actualMinutes, 0)
}

export function selfLeaderboardUser(): LeaderboardUser {
  const profile = useProfileStore.getState().profile
  const progress = useProgressStore.getState().progress
  return {
    id: 'self',
    displayName: profile.displayName,
    username: profile.username,
    avatarId: profile.avatarId,
    xp: progress.xp,
    focusMinutes: selfFocusMinutes(),
    streak: progress.currentStreak,
    dailyScore: selfDailyScore(),
    isFriend: true,
    isSelf: true,
  }
}

/** Full snapshot sorted by `metric` (descending) with a `rank` implied by index. */
export function rankedLeaderboard(metric: LeaderboardMetric): LeaderboardUser[] {
  const key = METRIC_META[metric].field
  const snapshot = leaderboardSnapshot(selfLeaderboardUser())
  return [...snapshot].sort((a, b) => {
    const diff = Number(b[key]) - Number(a[key])
    return diff !== 0 ? diff : a.displayName.localeCompare(b.displayName)
  })
}

export function rankOf(users: LeaderboardUser[], id = 'self'): number {
  return users.findIndex((u) => u.id === id) + 1
}

export { LEADERBOARD_USERS }
