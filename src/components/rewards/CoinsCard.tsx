import { Coins, Gift, ShoppingBag, TrendingUp } from 'lucide-react'
import { COIN_REWARDS } from '../../data/mock/gamification'
import { useProgressStore } from '../../store/useProgressStore'
import { useRewardStore } from '../../store/useRewardStore'
import { Panel } from '../common'

const WAYS: Array<{ label: string; amount: number }> = [
  { label: 'Sesi fokus selesai', amount: COIN_REWARDS.focusSession },
  { label: 'Tugas diselesaikan', amount: COIN_REWARDS.taskCompleted },
  { label: 'Sesi Pomodoro selesai', amount: COIN_REWARDS.pomodoroSession },
  { label: 'Bonus daily goal', amount: COIN_REWARDS.dailyGoalBonus },
]

export function CoinsCard() {
  const coins = useProgressStore((s) => s.progress.coins)
  const redemptions = useRewardStore((s) => s.redemptions)

  const spent = redemptions.reduce((sum, r) => sum + r.cost, 0)

  return (
    <Panel title="Coins kamu" description="Mata uang dalam aplikasi dari aktivitas produktif.">
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-warning-soft text-warning">
          <Coins className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-4xl font-bold tabular-nums text-ink">{coins}</p>
          <p className="mt-0.5 text-[12.5px] text-ink-muted">coins tersedia</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-surface-2 px-3.5 py-3">
          <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <Gift className="size-3.5 text-accent" /> Ditukar
          </div>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">
            {redemptions.length}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface-2 px-3.5 py-3">
          <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <ShoppingBag className="size-3.5 text-primary" /> Total belanja
          </div>
          <p className="mt-1 font-display text-xl font-semibold tabular-nums text-ink">{spent}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wider text-ink-muted">
          <TrendingUp className="size-3.5" /> Cara mendapat coins
        </p>
        <ul className="space-y-1.5">
          {WAYS.map((w) => (
            <li
              key={w.label}
              className="flex items-center justify-between rounded-lg bg-surface-2 px-3.5 py-2 text-[13px]"
            >
              <span className="text-ink-soft">{w.label}</span>
              <span className="font-medium tabular-nums text-warning">+{w.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  )
}
