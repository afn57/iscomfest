import { Coins, Sparkles, TrendingUp } from 'lucide-react'
import { levelFromXp } from '../../data/mock/gamification'
import { useProgressStore } from '../../store/useProgressStore'
import { Badge, Panel, ProgressBar } from '../common'

export function LevelCard() {
  const xp = useProgressStore((s) => s.progress.xp)
  const coins = useProgressStore((s) => s.progress.coins)
  const info = levelFromXp(xp)

  return (
    <Panel
      title="Level & XP"
      description="Naik level dengan menyelesaikan fokus, tugas, dan goal harian."
      action={<Badge tone="accent">Level {info.level}</Badge>}
    >
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Sparkles className="size-7" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold tabular-nums text-ink">
              {info.into}
              <span className="text-[15px] font-medium text-ink-muted"> / {info.needed} XP</span>
            </span>
            <span className="text-[12.5px] text-ink-muted">{info.percent}%</span>
          </div>
          <ProgressBar value={info.percent} className="mt-2" tone="primary" />
          <p className="mt-2 text-[12.5px] text-ink-muted">
            Menuju Level {info.level + 1} · total {info.total} XP
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-surface-2 px-3.5 py-3">
          <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <Coins className="size-3.5 text-warning" /> Coins
          </div>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">{coins}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2 px-3.5 py-3">
          <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <TrendingUp className="size-3.5 text-success" /> Bonus level
          </div>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">+100 XP</p>
        </div>
      </div>
    </Panel>
  )
}
