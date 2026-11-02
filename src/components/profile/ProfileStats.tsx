import { Coins, Crosshair, Flame, ListChecks, Trophy, Zap } from 'lucide-react'
import { taskCompletionStats } from '../../services/selectors'
import { useProgressStore } from '../../store/useProgressStore'
import { useTaskStore } from '../../store/useTaskStore'
import { useFocusStore } from '../../store/useFocusStore'
import { cn } from '../../utils/cn'

const ITEMS = [
  { key: 'xp', label: 'Total XP', icon: Zap, tone: 'bg-primary-soft text-primary' },
  { key: 'focus', label: 'Menit fokus', icon: Crosshair, tone: 'bg-accent-soft text-accent' },
  { key: 'tasks', label: 'Tugas selesai', icon: ListChecks, tone: 'bg-success-soft text-success' },
  { key: 'streak', label: 'Streak', icon: Flame, tone: 'bg-warning-soft text-warning' },
  { key: 'coins', label: 'Coins', icon: Coins, tone: 'bg-warning-soft text-warning' },
  { key: 'achievements', label: 'Achievement', icon: Trophy, tone: 'bg-primary-soft text-primary' },
] as const

export function ProfileStats() {
  const xp = useProgressStore((s) => s.progress.xp)
  const coins = useProgressStore((s) => s.progress.coins)
  const streak = useProgressStore((s) => s.progress.currentStreak)
  const unlocked = useProgressStore((s) => s.progress.unlocked)
  const tasks = useTaskStore((s) => s.tasks)
  const sessions = useFocusStore((s) => s.sessions)

  const stats: Record<(typeof ITEMS)[number]['key'], string> = {
    xp: xp.toLocaleString('id-ID'),
    focus: sessions.reduce((sum, s) => sum + s.actualMinutes, 0).toLocaleString('id-ID'),
    tasks: String(taskCompletionStats(tasks).completed),
    streak: `${streak} hr`,
    coins: coins.toLocaleString('id-ID'),
    achievements: String(unlocked.length),
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.key} className="rounded-card border border-line bg-surface px-3.5 py-3 shadow-card">
            <div className="flex items-center gap-2">
              <span className={cn('flex size-7 items-center justify-center rounded-lg', item.tone)}>
                <Icon className="size-3.5" />
              </span>
              <span className="truncate text-[12px] text-ink-muted">{item.label}</span>
            </div>
            <p className="mt-2 font-display text-xl font-bold tabular-nums text-ink">
              {stats[item.key]}
            </p>
          </div>
        )
      })}
    </div>
  )
}
