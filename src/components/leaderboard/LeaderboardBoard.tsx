import { Crown, Medal, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { LeaderboardMetric, LeaderboardUser } from '../../types'
import { METRIC_META, rankOf, rankedLeaderboard } from '../../services/leaderboard'
import { cn } from '../../utils/cn'
import { Avatar, Badge, Panel } from '../common'

const METRICS: LeaderboardMetric[] = ['daily', 'xp', 'focus', 'streak']

const MEDALS = [
  'bg-warning-soft text-warning',
  'bg-surface-3 text-ink-soft',
  'bg-warning/25 text-warning',
]

export function LeaderboardBoard() {
  const [metric, setMetric] = useState<LeaderboardMetric>('daily')
  const [friendsOnly, setFriendsOnly] = useState(false)

  const ranked = useMemo(() => rankedLeaderboard(metric), [metric])
  const selfRank = rankOf(ranked)
  const rows = friendsOnly ? ranked.filter((u) => u.isFriend) : ranked
  const podium = rows.slice(0, 3)
  const meta = METRIC_META[metric]

  const format = (u: LeaderboardUser) => `${Number(u[meta.field]).toLocaleString('id-ID')}`

  return (
    <Panel
      title="Leaderboard"
      description={`Peringkat berdasarkan ${meta.label.toLowerCase()} · data simulasi.`}
      action={
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFriendsOnly((v) => !v)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-medium transition-colors',
              friendsOnly
                ? 'border-primary bg-primary-soft text-primary'
                : 'border-line text-ink-muted hover:text-ink-soft',
            )}
          >
            <Users className="size-3.5" />
            Teman saja
          </button>
        </div>
      }
      padding="none"
    >
      <div className="flex flex-wrap gap-1.5 border-b border-line px-5 py-3">
        {METRICS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMetric(m)}
            className={cn(
              'rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors',
              metric === m
                ? 'border-primary bg-primary-soft text-primary'
                : 'border-line text-ink-muted hover:border-line-strong hover:text-ink-soft',
            )}
          >
            {METRIC_META[m].short}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 items-end gap-2 border-b border-line px-5 py-5">
        {[podium[1], podium[0], podium[2]].map((u, i) => {
          const order = [1, 0, 2][i]
          const rank = ranked.findIndex((x) => x.id === u?.id)
          if (!u) return <div key={`empty-${i}`} />
          const isFirst = u.id === podium[0]?.id
          return (
            <div key={u.id} className="flex flex-col items-center gap-1.5 text-center">
              <div className="relative">
                <Avatar
                  avatarId={u.avatarId}
                  name={u.displayName}
                  size={isFirst ? 'lg' : 'md'}
                  ring={isFirst}
                />
                <span
                  className={cn(
                    'absolute -bottom-1 left-1/2 flex size-5 -translate-x-1/2 items-center justify-center rounded-full text-[10px] font-bold',
                    MEDALS[order] ?? MEDALS[0],
                  )}
                >
                  {rank + 1}
                </span>
              </div>
              <p
                className={cn(
                  'max-w-full truncate text-[12.5px] font-medium',
                  u.isSelf ? 'text-primary' : 'text-ink',
                )}
              >
                {u.isSelf ? 'Kamu' : u.displayName.split(' ')[0]}
              </p>
              <p className="text-[12px] font-semibold tabular-nums text-ink-muted">
                {format(u)} <span className="text-[10.5px]">{meta.unit}</span>
              </p>
              {isFirst && <Crown className="size-4 text-warning" />}
            </div>
          )
        })}
      </div>

      <ul className="divide-y divide-line">
        {rows.map((u) => {
          const index = ranked.findIndex((x) => x.id === u.id)
          const rank = index + 1
          const isSelf = !!u.isSelf
          return (
            <li
              key={u.id}
              className={cn(
                'flex items-center gap-3 px-5 py-3 transition-colors',
                isSelf && 'bg-primary-soft/60',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg text-[12.5px] font-semibold tabular-nums',
                  rank <= 3 ? MEDALS[rank - 1] : 'bg-surface-3 text-ink-muted',
                )}
              >
                {rank <= 3 ? <Medal className="size-4" /> : rank}
              </span>

              <Avatar avatarId={u.avatarId} name={u.displayName} size="sm" />

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-[13.5px] font-medium text-ink">
                  <span className="truncate">{isSelf ? 'Kamu' : u.displayName}</span>
                  {isSelf && <Badge tone="primary">Profil kamu</Badge>}
                </p>
                <p className="truncate text-[11.5px] text-ink-muted">@{u.username}</p>
              </div>

              <div className="hidden shrink-0 gap-5 text-right text-[12.5px] text-ink-muted sm:flex">
                <span className="w-16 tabular-nums">
                  {u.xp.toLocaleString('id-ID')}
                  <span className="block text-[10.5px] text-ink-muted/70">XP</span>
                </span>
                <span className="w-16 tabular-nums">
                  {u.focusMinutes.toLocaleString('id-ID')}
                  <span className="block text-[10.5px] text-ink-muted/70">mnt</span>
                </span>
                <span className="w-16 tabular-nums">
                  {u.streak}
                  <span className="block text-[10.5px] text-ink-muted/70">hari</span>
                </span>
              </div>

              <span className="shrink-0 text-right">
                <span className="block font-display text-[15px] font-semibold tabular-nums text-ink">
                  {format(u)}
                </span>
                <span className="block text-[10.5px] uppercase tracking-wide text-ink-muted">
                  {meta.short}
                </span>
              </span>
            </li>
          )
        })}
      </ul>

      <div className="border-t border-line px-5 py-3 text-[12.5px] text-ink-muted">
        Peringkat kamu saat ini: <span className="font-semibold text-primary">#{selfRank}</span> dari{' '}
        {ranked.length} peserta
        {friendsOnly && ' (filter teman aktif)'}.
      </div>
    </Panel>
  )
}
