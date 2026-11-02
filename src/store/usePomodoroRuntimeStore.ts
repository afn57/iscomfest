import { create } from 'zustand'
import type { PomodoroPhase } from '../types'
import { nextPhase, phaseDuration, usePomodoroStore } from './usePomodoroStore'
import { completePomodoroPhase } from '../services/actions'
import { playChime } from '../utils/sound'

/**
 * Runtime (non-persisted) state for the Pomodoro timer.
 *
 * Kept in a store rather than component state so the countdown keeps running
 * while the user switches tabs or navigates to another page.
 */
interface PomodoroRuntimeState {
  phase: PomodoroPhase
  cycleIndex: number
  running: boolean
  /** epoch ms at which the current phase ends (null when not running) */
  endsAt: number | null
  remainingMs: number
  taskId?: string
  justFinished: PomodoroPhase | null

  start: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  skip: () => void
  setTask: (taskId?: string) => void
  applyPhase: (phase: PomodoroPhase, cycleIndex: number) => void
  clearFinished: () => void
  handleComplete: () => void
}

const initialRemaining = () =>
  phaseDuration('focus', usePomodoroStore.getState().settings) * 60_000

export const usePomodoroRuntimeStore = create<PomodoroRuntimeState>((set, get) => ({
  phase: 'focus',
  cycleIndex: 1,
  running: false,
  endsAt: null,
  remainingMs: initialRemaining(),
  taskId: undefined,
  justFinished: null,

  start: () => {
    const { phase, remainingMs } = get()
    void phase
    set({ running: true, endsAt: Date.now() + remainingMs, justFinished: null })
  },

  pause: () => {
    const { endsAt, running } = get()
    if (!running || endsAt === null) return
    set({ running: false, remainingMs: Math.max(0, endsAt - Date.now()), endsAt: null })
  },

  resume: () => get().start(),

  reset: () => {
    set({
      running: false,
      endsAt: null,
      remainingMs: phaseDuration(get().phase, usePomodoroStore.getState().settings) * 60_000,
      justFinished: null,
    })
  },

  skip: () => {
    const { phase, cycleIndex } = get()
    const settings = usePomodoroStore.getState().settings
    const next = nextPhase(phase, cycleIndex, settings)
    set({
      phase: next.phase,
      cycleIndex: next.cycleIndex,
      running: false,
      endsAt: null,
      remainingMs: phaseDuration(next.phase, settings) * 60_000,
      justFinished: null,
    })
  },

  setTask: (taskId) => set({ taskId }),

  applyPhase: (phase, cycleIndex) => {
    set({
      phase,
      cycleIndex,
      running: false,
      endsAt: null,
      remainingMs: phaseDuration(phase, usePomodoroStore.getState().settings) * 60_000,
      justFinished: null,
    })
  },

  clearFinished: () => set({ justFinished: null }),

  handleComplete: () => {
    const { phase, cycleIndex, taskId } = get()
    const settings = usePomodoroStore.getState().settings
    const minutes = phaseDuration(phase, settings)
    const next = nextPhase(phase, cycleIndex, settings)

    completePomodoroPhase(phase, minutes, taskId)

    if (usePomodoroStore.getState().settings.soundEnabled) {
      playChime(phase === 'focus' ? 'focus_done' : 'break_done')
    }

    const autoStart =
      phase === 'focus' ? settings.autoStartBreaks : settings.autoStartFocus

    set({
      phase: next.phase,
      cycleIndex: next.cycleIndex,
      remainingMs: phaseDuration(next.phase, settings) * 60_000,
      endsAt: autoStart ? Date.now() + phaseDuration(next.phase, settings) * 60_000 : null,
      running: autoStart,
      justFinished: phase,
    })
  },
}))
