import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActivityLogEntry, DailyGoalProgress, Progress, UnlockedAchievement } from '../types'
import { createSeedProgress } from '../data/mock/gamification'
import { todayKey } from '../utils/date'
import { computeStreaks } from '../utils/streak'
import { uid } from '../utils/id'
import { useCalendarStore } from './useCalendarStore'

interface ProgressState {
  progress: Progress
  addXp: (amount: number) => void
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  recordActivity: (date?: string) => void
  /** Re-derives streak counters from activity + scheduled rest days. */
  recomputeStreak: () => void
  unlock: (achievementId: string) => boolean
  setGoalValue: (goalId: string, value: number, date?: string) => void
  bumpGoalValue: (goalId: string, delta: number, date?: string) => void
  pushLog: (entry: Omit<ActivityLogEntry, 'id' | 'at'> & { at?: string }) => void
  reset: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: createSeedProgress(),

      addXp: (amount) =>
        set((s) => ({ progress: { ...s.progress, xp: Math.max(0, s.progress.xp + amount) } })),

      addCoins: (amount) =>
        set((s) => ({ progress: { ...s.progress, coins: Math.max(0, s.progress.coins + amount) } })),

      spendCoins: (amount) => {
        const { progress } = get()
        if (progress.coins < amount) return false
        set({ progress: { ...progress, coins: progress.coins - amount } })
        return true
      },

      /**
       * Marks a calendar day as "active" and recomputes streak counters.
       * Rest days stay neutral — see utils/streak.ts.
       */
      recordActivity: (date) => {
        const key = date ?? todayKey()
        set((s) => {
          const activityDates = s.progress.activityDates.includes(key)
            ? s.progress.activityDates
            : [...s.progress.activityDates, key]
          const streak = computeStreaks(activityDates, useCalendarStore.getState().getRestDates())
          return {
            progress: {
              ...s.progress,
              activityDates,
              currentStreak: streak.current,
              longestStreak: Math.max(s.progress.longestStreak, streak.longest),
            },
          }
        })
      },

      recomputeStreak: () => {
        set((s) => {
          const streak = computeStreaks(
            s.progress.activityDates,
            useCalendarStore.getState().getRestDates(),
          )
          return {
            progress: {
              ...s.progress,
              currentStreak: streak.current,
              longestStreak: Math.max(s.progress.longestStreak, streak.longest),
            },
          }
        })
      },

      unlock: (achievementId) => {
        const { progress } = get()
        if (progress.unlocked.some((u) => u.id === achievementId)) return false
        const unlocked: UnlockedAchievement[] = [
          ...progress.unlocked,
          { id: achievementId, unlockedAt: new Date().toISOString() },
        ]
        set({ progress: { ...progress, unlocked } })
        return true
      },

      setGoalValue: (goalId, value, date) => {
        const key = date ?? todayKey()
        set((s) => {
          const list = [...s.progress.goalProgress]
          const idx = list.findIndex((g) => g.date === key)
          if (idx === -1) {
            list.push({ date: key, values: { [goalId]: value } })
          } else {
            const entry: DailyGoalProgress = {
              ...list[idx],
              values: { ...list[idx].values, [goalId]: Math.max(list[idx].values[goalId] ?? 0, value) },
            }
            list[idx] = entry
          }
          return { progress: { ...s.progress, goalProgress: list } }
        })
      },

      bumpGoalValue: (goalId, delta, date) => {
        const key = date ?? todayKey()
        set((s) => {
          const list = [...s.progress.goalProgress]
          const idx = list.findIndex((g) => g.date === key)
          if (idx === -1) {
            list.push({ date: key, values: { [goalId]: delta } })
          } else {
            const entry: DailyGoalProgress = {
              ...list[idx],
              values: { ...list[idx].values, [goalId]: (list[idx].values[goalId] ?? 0) + delta },
            }
            list[idx] = entry
          }
          return { progress: { ...s.progress, goalProgress: list } }
        })
      },

      pushLog: (entry) => {
        set((s) => {
          const item: ActivityLogEntry = {
            id: uid('log'),
            at: entry.at ?? new Date().toISOString(),
            type: entry.type,
            message: entry.message,
            xp: entry.xp,
          }
          return { progress: { ...s.progress, log: [item, ...s.progress.log].slice(0, 60) } }
        })
      },

      reset: () => set({ progress: createSeedProgress() }),
    }),
    {
      name: 'focusly_progress',
      version: 1,
      partialize: (s) => ({ progress: s.progress }),
    },
  ),
)
