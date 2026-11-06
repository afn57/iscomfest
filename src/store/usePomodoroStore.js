import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedPomodoro } from '../data/mock/focus';
import { uid } from '../utils/id';
export const DEFAULT_POMODORO = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: true,
    autoStartFocus: false,
    soundEnabled: true,
};
export const usePomodoroStore = create()(persist((set) => ({
    settings: DEFAULT_POMODORO,
    records: createSeedPomodoro(),
    updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    record: (entry) => {
        const created = { ...entry, id: uid('pom') };
        set((s) => ({ records: [created, ...s.records].slice(0, 300) }));
        return created;
    },
    clearHistory: () => set({ records: [] }),
    reset: () => set({ settings: DEFAULT_POMODORO, records: createSeedPomodoro() }),
}), { name: 'focusly_pomodoro', version: 1 }));
/** Which phase comes next, following the 4-focus → long break rule. */
export function nextPhase(phase, cycleIndex, settings) {
    if (phase === 'focus') {
        const nextCycle = cycleIndex + 1;
        if (nextCycle > settings.sessionsBeforeLongBreak) {
            return { phase: 'long_break', cycleIndex: 1 };
        }
        return { phase: 'short_break', cycleIndex: nextCycle };
    }
    return { phase: 'focus', cycleIndex };
}
export function phaseDuration(phase, settings) {
    if (phase === 'focus')
        return settings.focusMinutes;
    if (phase === 'short_break')
        return settings.shortBreakMinutes;
    return settings.longBreakMinutes;
}
export const PHASE_META = {
    focus: { label: 'Focus', className: 'text-primary' },
    short_break: { label: 'Short Break', className: 'text-success' },
    long_break: { label: 'Long Break', className: 'text-accent' },
};
