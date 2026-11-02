import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActiveFocus, FocusSchedule, FocusSession, RestrictedApp } from '../types'
import { DEFAULT_SCHEDULES, RESTRICTED_APPS, createSeedFocusSessions } from '../data/mock/focus'
import { uid } from '../utils/id'

interface FocusState {
  sessions: FocusSession[]
  schedules: FocusSchedule[]
  active: ActiveFocus | null
  selectedAppIds: string[]
  customApps: RestrictedApp[]
  dndEnabled: boolean

  start: (input: { taskId?: string; plannedMinutes: number; dnd: boolean; appIds: string[] }) => void
  pause: () => void
  resume: () => void
  /** Ends the running session and returns the recorded entry (null if nothing ran). */
  end: (status?: 'completed' | 'ended_early') => FocusSession | null
  toggleApp: (id: string) => void
  setApps: (ids: string[]) => void
  addCustomApp: (name: string, host: string) => void
  removeCustomApp: (id: string) => void
  setDnd: (value: boolean) => void
  addSchedule: (schedule: Omit<FocusSchedule, 'id'>) => void
  updateSchedule: (id: string, patch: Partial<FocusSchedule>) => void
  removeSchedule: (id: string) => void
  reset: () => void
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      sessions: createSeedFocusSessions(),
      schedules: DEFAULT_SCHEDULES,
      active: null,
      selectedAppIds: ['instagram', 'tiktok', 'youtube'],
      customApps: [],
      dndEnabled: true,

      start: ({ taskId, plannedMinutes, dnd, appIds }) =>
        set({
          active: {
            id: uid('focus'),
            taskId,
            startedAt: new Date().toISOString(),
            plannedMinutes,
            dnd,
            restrictedAppIds: appIds,
            accumulatedPauseMs: 0,
          },
        }),

      pause: () =>
        set((s) =>
          s.active && !s.active.pausedAt
            ? { active: { ...s.active, pausedAt: new Date().toISOString() } }
            : s,
        ),

      resume: () =>
        set((s) => {
          if (!s.active?.pausedAt) return s
          const pausedAt = new Date(s.active.pausedAt).getTime()
          const active: ActiveFocus = {
            ...s.active,
            accumulatedPauseMs: s.active.accumulatedPauseMs + (Date.now() - pausedAt),
          }
          delete active.pausedAt
          return { active }
        }),

      end: (status = 'ended_early') => {
        const active = get().active
        if (!active) return null
        const now = Date.now()
        const started = new Date(active.startedAt).getTime()
        const pausedTotal =
          active.accumulatedPauseMs + (active.pausedAt ? now - new Date(active.pausedAt).getTime() : 0)
        const elapsedMs = Math.max(0, now - started - pausedTotal)
        const actualMinutes = Math.max(1, Math.round(elapsedMs / 60_000))
        const planned = active.plannedMinutes
        const finalStatus: FocusSession['status'] =
          status === 'completed' || actualMinutes >= planned ? 'completed' : 'ended_early'

        const session: FocusSession = {
          id: active.id,
          taskId: active.taskId,
          startedAt: active.startedAt,
          endedAt: new Date().toISOString(),
          plannedMinutes: planned,
          actualMinutes: finalStatus === 'completed' ? planned : actualMinutes,
          status: finalStatus,
          dnd: active.dnd,
          restrictedAppIds: active.restrictedAppIds,
        }

        set((s) => ({ active: null, sessions: [session, ...s.sessions] }))
        return session
      },

      toggleApp: (id) =>
        set((s) => ({
          selectedAppIds: s.selectedAppIds.includes(id)
            ? s.selectedAppIds.filter((x) => x !== id)
            : [...s.selectedAppIds, id],
        })),

      setApps: (ids) => set({ selectedAppIds: ids }),

      addCustomApp: (name, host) => {
        const app: RestrictedApp = { id: uid('app'), name, kind: 'custom', host }
        set((s) => ({
          customApps: [...s.customApps, app],
          selectedAppIds: [...s.selectedAppIds, app.id],
        }))
      },

      removeCustomApp: (id) =>
        set((s) => ({
          customApps: s.customApps.filter((a) => a.id !== id),
          selectedAppIds: s.selectedAppIds.filter((x) => x !== id),
        })),

      setDnd: (value) => set({ dndEnabled: value }),

      addSchedule: (schedule) =>
        set((s) => ({ schedules: [...s.schedules, { ...schedule, id: uid('sch') }] })),

      updateSchedule: (id, patch) =>
        set((s) => ({
          schedules: s.schedules.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),

      removeSchedule: (id) =>
        set((s) => ({ schedules: s.schedules.filter((x) => x.id !== id) })),

      reset: () =>
        set({
          sessions: createSeedFocusSessions(),
          schedules: DEFAULT_SCHEDULES,
          active: null,
          selectedAppIds: ['instagram', 'tiktok', 'youtube'],
          customApps: [],
          dndEnabled: true,
        }),
    }),
    { name: 'focusly_focus', version: 1 },
  ),
)

export const selectAllApps = (s: Pick<FocusState, 'customApps'>): RestrictedApp[] => [
  ...RESTRICTED_APPS,
  ...s.customApps,
]
