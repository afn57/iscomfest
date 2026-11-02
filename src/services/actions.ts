import { COIN_REWARDS, XP_REWARDS } from '../data/mock/gamification'
import { REWARDS } from '../data/mock/social'
import { useCalendarStore } from '../store/useCalendarStore'
import { useFocusStore } from '../store/useFocusStore'
import { useNotificationStore } from '../store/useNotificationStore'
import { usePomodoroStore } from '../store/usePomodoroStore'
import { useProgressStore } from '../store/useProgressStore'
import { useRewardStore } from '../store/useRewardStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useTaskStore } from '../store/useTaskStore'
import { toast } from '../store/useToastStore'
import type { FocusSession, PomodoroPhase, Reward, Task, TaskVerification } from '../types'
import { deadlineUrgency } from '../utils/date'
import {
  awardCoins,
  awardXp,
  bumpGoal,
  evaluateAchievements,
  recordProductiveDay,
} from './gamification'

/* ------------------------------------------------------------------ */
/*  Tasks                                                              */
/* ------------------------------------------------------------------ */

export function completeTaskWithVerification(
  task: Task,
  input: Omit<TaskVerification, 'verifiedAt'>,
): void {
  const verification: TaskVerification = { ...input, verifiedAt: new Date().toISOString() }
  useTaskStore.getState().complete(task.id, verification)

  awardXp(XP_REWARDS.taskCompleted)
  awardCoins(COIN_REWARDS.taskCompleted)
  recordProductiveDay()
  bumpGoal('tasks_done', 1)

  useProgressStore.getState().pushLog({
    type: 'task',
    message: `Menyelesaikan "${task.title}"`,
    xp: XP_REWARDS.taskCompleted,
  })
  useNotificationStore.getState().push({
    kind: 'system',
    title: 'Tugas selesai',
    body: `"${task.title}" ditandai Completed.`,
    href: '/tasks',
  })

  const urgency = deadlineUrgency(task.deadline, task.status)
  const bonus =
    urgency === 'overdue'
      ? 'Tugas ini sudah terlambat — bagus sudah diselesaikan.'
      : 'Kerja bagus, satu tugas lebih ringan.'

  toast.success('Tugas diselesaikan', `+${XP_REWARDS.taskCompleted} XP · ${bonus}`)
}

/* ------------------------------------------------------------------ */
/*  Focus mode                                                         */
/* ------------------------------------------------------------------ */

export interface StartFocusInput {
  taskId?: string
  plannedMinutes: number
  dnd: boolean
  appIds: string[]
}

export function startFocusSession(input: StartFocusInput): void {
  useFocusStore.getState().start(input)
  useNotificationStore.getState().push({
    kind: 'focus',
    title: 'Focus Mode aktif',
    body: `${input.plannedMinutes} menit dimulai${input.dnd ? ' dengan Do Not Disturb' : ''}.`,
    dedupe: `focus-start:${Date.now()}`,
  })
}

export function finishFocusSession(
  status: 'completed' | 'ended_early',
): FocusSession | null {
  const session = useFocusStore.getState().end(status)
  if (!session) return null

  const completed = session.status === 'completed'
  const dndBonus = session.dnd ? 0 : -5

  if (completed) {
    awardXp(XP_REWARDS.focusSession)
    awardCoins(COIN_REWARDS.focusSession)
    bumpGoal('focus_minutes', session.actualMinutes)
    bumpGoal('focus_sessions', 1)
    if (session.dnd) recordProductiveDay()

    useProgressStore.getState().pushLog({
      type: 'focus',
      message: `Menyelesaikan sesi fokus ${session.actualMinutes} menit${
        session.dnd ? ' dengan Do Not Disturb aktif' : ''
      }`,
      xp: XP_REWARDS.focusSession,
    })
    toast.success(
      `Sesi fokus ${session.actualMinutes} menit selesai`,
      session.dnd
        ? `+${XP_REWARDS.focusSession} XP · DND aktif, streak hari ini aman.`
        : `+${XP_REWARDS.focusSession} XP · DND nonaktif (streak butuh DND atau daily goal).`,
    )
  } else {
    awardXp(Math.max(5, XP_REWARDS.focusSessionEarlyEnd + dndBonus))
    toast.info(
      'Sesi diakhiri lebih awal',
      `${session.actualMinutes} menit tercatat. Mulai lagi kapan saja.`,
    )
  }

  useNotificationStore.getState().push({
    kind: 'focus',
    title: completed ? 'Sesi fokus selesai' : 'Sesi fokus diakhiri',
    body: `${session.actualMinutes} menit tercatat.`,
    href: '/focus',
  })

  evaluateAchievements()
  return session
}

/* ------------------------------------------------------------------ */
/*  Pomodoro                                                           */
/* ------------------------------------------------------------------ */

export function completePomodoroPhase(phase: PomodoroPhase, minutes: number, taskId?: string): void {
  const cycleIndex = usePomodoroStore.getState().records.filter((r) => r.phase === 'focus').length + 1
  usePomodoroStore.getState().record({
    phase,
    minutes,
    completedAt: new Date().toISOString(),
    taskId,
    cycleIndex: ((cycleIndex - 1) % 4) + 1,
    finishedNaturally: true,
  })

  if (phase !== 'focus') return

  awardXp(XP_REWARDS.pomodoroSession)
  awardCoins(COIN_REWARDS.pomodoroSession)
  bumpGoal('pomodoro_sessions', 1)
  bumpGoal('focus_minutes', minutes)
  recordProductiveDay()

  useProgressStore.getState().pushLog({
    type: 'pomodoro',
    message: `Menyelesaikan sesi Pomodoro ${minutes} menit`,
    xp: XP_REWARDS.pomodoroSession,
  })
  useNotificationStore.getState().push({
    kind: 'focus',
    title: 'Sesi Pomodoro selesai',
    body: `${minutes} menit fokus. Saatnya istirahat.`,
    href: '/focus',
    dedupe: `pomodoro:${Date.now()}`,
  })
  toast.success(`Pomodoro ${minutes} menit selesai`, `+${XP_REWARDS.pomodoroSession} XP · lanjutkan atau istirahat.`)
}

/* ------------------------------------------------------------------ */
/*  Rewards                                                            */
/* ------------------------------------------------------------------ */

export type RedeemResult = { ok: true } | { ok: false; reason: string }

export function redeemReward(reward: Reward): RedeemResult {
  const coins = useProgressStore.getState().progress.coins
  if (coins < reward.cost) {
    toast.error('Coins tidak cukup', `Butuh ${reward.cost} coins, tersisa ${coins}.`)
    return { ok: false, reason: 'insufficient-coins' }
  }

  useProgressStore.getState().spendCoins(reward.cost)
  useRewardStore.getState().add({ rewardId: reward.id, rewardName: reward.name, cost: reward.cost })
  useProgressStore.getState().pushLog({
    type: 'reward',
    message: `Menukarkan ${reward.cost} coins untuk ${reward.name}`,
  })
  if (useSettingsStore.getState().settings.notifications.rewardUpdates) {
    useNotificationStore.getState().push({
      kind: 'reward',
      title: 'Reward ditukarkan',
      body: `${reward.name} sudah masuk ke koleksi kamu.`,
      href: '/rewards',
    })
  }
  toast.success('Reward ditukarkan', `${reward.name} · -${reward.cost} coins`)
  return { ok: true }
}

export function isRewardRedeemed(rewardId: string): boolean {
  return useRewardStore.getState().redemptions.some((r) => r.rewardId === rewardId)
}

export const rewardById = (id: string): Reward | undefined => REWARDS.find((r) => r.id === id)

/* ------------------------------------------------------------------ */
/*  Rest day                                                           */
/* ------------------------------------------------------------------ */

export function scheduleRestDay(date: string, reason?: string): void {
  useCalendarStore.getState().addRestDay(date, reason)
  const existing = useCalendarStore.getState().events.find(
    (e) => e.date === date && e.type === 'rest',
  )
  if (!existing) {
    useCalendarStore.getState().addEvent({
      title: 'Rest Day',
      type: 'rest',
      date,
      note: reason ?? 'Istirahat terjadwal — streak tetap aman.',
    })
  }
  useProgressStore.getState().recomputeStreak()
  useProgressStore.getState().pushLog({
    type: 'rest',
    message: `Menjadwalkan Rest Day${reason ? ` — ${reason}` : ''}`,
  })
  useNotificationStore.getState().push({
    kind: 'system',
    title: 'Rest Day dijadwalkan',
    body: 'Istirahat tidak mengurangi streak selama dijadwalkan lewat fitur ini.',
    href: '/achievements',
  })
  toast.info('Rest Day dijadwalkan', 'Istirahat itu bagian dari rencana, bukan pelarian.')
}

export function cancelRestDay(date: string): void {
  useCalendarStore.getState().removeRestDayByDate(date)
  useCalendarStore
    .getState()
    .events.filter((e) => e.date === date && e.type === 'rest')
    .forEach((e) => useCalendarStore.getState().removeEvent(e.id))
  useProgressStore.getState().recomputeStreak()
}
