import {
  AlertTriangle,
  Bell,
  Clock,
  Flame,
  Gift,
  Info,
  Trophy,
  Crosshair,
} from 'lucide-react'
import type { NotificationKind } from '../../types'

export type KindIcon = typeof Bell

export const KIND_META: Record<NotificationKind, { icon: KindIcon; tone: string }> = {
  deadline: { icon: Clock, tone: 'text-warning bg-warning-soft' },
  overdue: { icon: AlertTriangle, tone: 'text-danger bg-danger-soft' },
  focus: { icon: Crosshair, tone: 'text-primary bg-primary-soft' },
  streak: { icon: Flame, tone: 'text-warning bg-warning-soft' },
  reward: { icon: Gift, tone: 'text-accent bg-accent-soft' },
  achievement: { icon: Trophy, tone: 'text-success bg-success-soft' },
  system: { icon: Info, tone: 'text-ink-soft bg-surface-3' },
}

export const KIND_LABEL: Record<NotificationKind, string> = {
  deadline: 'Deadline',
  overdue: 'Terlambat',
  focus: 'Focus',
  streak: 'Streak',
  reward: 'Reward',
  achievement: 'Achievement',
  system: 'Sistem',
}

export const NOTIFICATION_KINDS: NotificationKind[] = [
  'deadline',
  'overdue',
  'focus',
  'streak',
  'reward',
  'achievement',
  'system',
]
