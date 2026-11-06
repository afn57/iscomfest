import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedProgress } from '../data/mock/gamification';
import { todayKey } from '../utils/date';
import { computeStreaks } from '../utils/streak';
import { uid } from '../utils/id';
import { useCalendarStore } from './useCalendarStore';
export const useProgressStore = create()(persist((set) => ({
    progress: createSeedProgress(),
    addXp: (amount) => set((s) => ({ progress: { ...s.progress, xp: Math.max(0, s.progress.xp + amount) } })),
    /**
     * Marks a calendar day as "active" and recomputes streak counters.
     * Rest days stay neutral — see utils/streak.ts.
     */
    recordActivity: (date) => {
        const key = date ?? todayKey();
        set((s) => {
            const activityDates = s.progress.activityDates.includes(key)
                ? s.progress.activityDates
                : [...s.progress.activityDates, key];
            const streak = computeStreaks(activityDates, useCalendarStore.getState().getRestDates());
            return {
                progress: {
                    ...s.progress,
                    activityDates,
                    currentStreak: streak.current,
                    longestStreak: Math.max(s.progress.longestStreak, streak.longest),
                },
            };
        });
    },
    recomputeStreak: () => {
        set((s) => {
            const streak = computeStreaks(s.progress.activityDates, useCalendarStore.getState().getRestDates());
            return {
                progress: {
                    ...s.progress,
                    currentStreak: streak.current,
                    longestStreak: Math.max(s.progress.longestStreak, streak.longest),
                },
            };
        });
    },
    setGoalValue: (goalId, value, date) => {
        const key = date ?? todayKey();
        set((s) => {
            const list = [...s.progress.goalProgress];
            const idx = list.findIndex((g) => g.date === key);
            if (idx === -1) {
                list.push({ date: key, values: { [goalId]: value } });
            }
            else {
                const entry = {
                    ...list[idx],
                    values: { ...list[idx].values, [goalId]: Math.max(list[idx].values[goalId] ?? 0, value) },
                };
                list[idx] = entry;
            }
            return { progress: { ...s.progress, goalProgress: list } };
        });
    },
    bumpGoalValue: (goalId, delta, date) => {
        const key = date ?? todayKey();
        set((s) => {
            const list = [...s.progress.goalProgress];
            const idx = list.findIndex((g) => g.date === key);
            if (idx === -1) {
                list.push({ date: key, values: { [goalId]: delta } });
            }
            else {
                const entry = {
                    ...list[idx],
                    values: { ...list[idx].values, [goalId]: (list[idx].values[goalId] ?? 0) + delta },
                };
                list[idx] = entry;
            }
            return { progress: { ...s.progress, goalProgress: list } };
        });
    },
    pushLog: (entry) => {
        set((s) => {
            const item = {
                id: uid('log'),
                at: entry.at ?? new Date().toISOString(),
                type: entry.type,
                message: entry.message,
                xp: entry.xp,
            };
            return { progress: { ...s.progress, log: [item, ...s.progress.log].slice(0, 60) } };
        });
    },
    reset: () => set({ progress: createSeedProgress() }),
}), {
    name: 'focusly_progress',
    version: 2,
    partialize: (s) => ({ progress: s.progress }),
    migrate: (persisted) => {
        const p = persisted?.progress;
        if (!p)
            return persisted;
        const { coins: _coins, unlocked: _unlocked, ...rest } = p;
        return { progress: rest };
    },
}));
