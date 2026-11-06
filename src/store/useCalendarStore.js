import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSeedEvents } from '../data/mock/calendar';
import { createSeedRestDays } from '../data/mock/gamification';
import { uid } from '../utils/id';
export const useCalendarStore = create()(persist((set, get) => ({
    events: createSeedEvents(),
    restDays: createSeedRestDays(),
    addEvent: (event) => {
        const created = { ...event, id: uid('ev') };
        set((s) => ({ events: [...s.events, created] }));
        return created;
    },
    updateEvent: (id, patch) => set((s) => ({
        events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    })),
    removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
    addRestDay: (date, reason) => {
        const existing = get().restDays.find((r) => r.date === date);
        if (existing)
            return existing;
        const created = { id: uid('rest'), date, reason };
        set((s) => ({ restDays: [...s.restDays, created] }));
        return created;
    },
    removeRestDay: (id) => set((s) => ({ restDays: s.restDays.filter((r) => r.id !== id) })),
    removeRestDayByDate: (date) => set((s) => ({ restDays: s.restDays.filter((r) => r.date !== date) })),
    getRestDates: () => get().restDays.map((r) => r.date),
    isRestDay: (date) => get().restDays.some((r) => r.date === date),
    reset: () => set({ events: createSeedEvents(), restDays: createSeedRestDays() }),
}), { name: 'focusly_calendar', version: 1 }));
