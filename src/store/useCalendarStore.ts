import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CalendarEvent, RestDay } from '../types'
import { createSeedEvents } from '../data/mock/social'
import { createSeedRestDays } from '../data/mock/gamification'
import { uid } from '../utils/id'

interface CalendarState {
  events: CalendarEvent[]
  restDays: RestDay[]
  addEvent: (event: Omit<CalendarEvent, 'id'>) => CalendarEvent
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void
  removeEvent: (id: string) => void
  addRestDay: (date: string, reason?: string) => RestDay
  removeRestDay: (id: string) => void
  removeRestDayByDate: (date: string) => void
  getRestDates: () => string[]
  isRestDay: (date: string) => boolean
  reset: () => void
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: createSeedEvents(),
      restDays: createSeedRestDays(),

      addEvent: (event) => {
        const created: CalendarEvent = { ...event, id: uid('ev') }
        set((s) => ({ events: [...s.events, created] }))
        return created
      },

      updateEvent: (id, patch) =>
        set((s) => ({
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      removeEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      addRestDay: (date, reason) => {
        const existing = get().restDays.find((r) => r.date === date)
        if (existing) return existing
        const created: RestDay = { id: uid('rest'), date, reason }
        set((s) => ({ restDays: [...s.restDays, created] }))
        return created
      },

      removeRestDay: (id) => set((s) => ({ restDays: s.restDays.filter((r) => r.id !== id) })),

      removeRestDayByDate: (date) =>
        set((s) => ({ restDays: s.restDays.filter((r) => r.date !== date) })),

      getRestDates: () => get().restDays.map((r) => r.date),

      isRestDay: (date) => get().restDays.some((r) => r.date === date),

      reset: () => set({ events: createSeedEvents(), restDays: createSeedRestDays() }),
    }),
    { name: 'focusly_calendar', version: 1 },
  ),
)
