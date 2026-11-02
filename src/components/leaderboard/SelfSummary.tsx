import { ArrowUpRight, Crosshair, Flame, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { METRIC_META, rankOf, rankedLeaderboard, selfLeaderboardUser } from '../../services/leaderboard'
import type { LeaderboardMetric } from '../../types'
import { cn } from '../../utils/cn'
import { Panel } from '../common'

const ITEMS: Array<{ metric: LeaderboardMetric; icon: typeof Zap; tone: string }> = [
  { metric: 'daily', icon: Zap, tone: 'text-primary bg-primary-soft' },
  { metric: 'xp', icon: ArrowUpRight, tone: 'text-secondary bg-primary-soft' },
  { metric: 'focus', icon: Crosshair, tone: 'text-accent bg-accent-soft' },
  { metric: 'streak', icon: Flame, tone: 'text-warning bg-warning-soft' },
]

export function SelfSummary() {
  const self = selfLeaderboardUser()

  return (
    <Panel
      title="Posisi kamu"
      description="Dihitung ulang dari data progres lokal setiap kali halaman dibuka."
      action={
        <Link
          to="/profile"
          className="text-[12.5px] font-medium text-primary hover:underline"
        >
          Lihat profil
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ITEMS.map(({ metric, icon: Icon, tone }) => {
          const ranked = rankedLeaderboard(metric)
          const rank = rankOf(ranked)
          const meta = METRIC_META[metric]
          const value = Number(self[meta.field])
          const leader = Number(ranked[0]?.[meta.field] ?? 0)
          const gap = Math.max(0, leader - value)

          return (
            <div
              key={metric}
              className="rounded-xl border border-line bg-surface-2 px-3.5 py-3"
            >
              <div className="flex items-center gap-2">
                <span className={cn('flex size-7 items-center justify-center rounded-lg', tone)}>
                  <Icon className="size-3.5" />
                </span>
                <span className="text-[12px] text-ink-muted">{meta.short}</span>
              </div>
              <p className="mt-2 font-display text-xl font-bold tabular-nums text-ink">
                #{rank}
              </p>
              <p className="mt-0.5 text-[11.5px] tabular-nums text-ink-muted">
                {value.toLocaleString('id-ID')} {meta.unit}
                {rank > 1 && <span> · selisih {gap.toLocaleString('id-ID')}</span>}
              </p>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-muted">
        Skor harian kamu dihitung dari daily goal yang tercapai (60%) dan panjang streak (40%),
        sehingga naik otomatis setiap kali kamu menyelesaikan aktivitas.
      </p>
    </Panel>
  )
}
