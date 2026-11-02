import { CheckCircle2, Gift, Target } from 'lucide-react'
import { DAILY_GOALS, XP_REWARDS } from '../../data/mock/gamification'
import { goalSummary } from '../../services/selectors'
import { useProgressStore } from '../../store/useProgressStore'
import { cn } from '../../utils/cn'
import { dayKey, todayKey } from '../../utils/date'
import { Badge, Panel, ProgressBar } from '../common'

export function DailyGoalsPanel() {
  const goalProgress = useProgressStore((s) => s.progress.goalProgress)
  const summary = goalSummary()
  const today = todayKey()

  const history = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = dayKey(d)
    const values = goalProgress.find((g) => g.date === key)?.values ?? {}
    const met = DAILY_GOALS.filter((g) => (values[g.id] ?? 0) >= g.target).length
    return { key, met, total: DAILY_GOALS.length, date: d, isToday: key === today }
  })

  return (
    <Panel
      title="Daily Goals"
      description="Target harian yang memberi bonus XP ketika seluruhnya tercapai."
      action={
        summary.allMet ? (
          <Badge tone="success" icon={<CheckCircle2 />}>
            Semua tercapai
          </Badge>
        ) : (
          <Badge tone="outline">
            {summary.metCount}/{summary.total} tercapai
          </Badge>
        )
      }
    >
      <div className="space-y-3.5">
        {summary.items.map(({ goal, value, met, percent }) => (
          <div key={goal.id}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2 text-[13.5px] text-ink-soft">
                <Target className={cn('size-3.5 shrink-0', met ? 'text-success' : 'text-ink-muted')} />
                <span className="truncate">{goal.label}</span>
                {met && <Badge tone="success">done</Badge>}
              </span>
              <span className="shrink-0 text-[12.5px] tabular-nums text-ink-muted">
                {value}/{goal.target} {goal.unit === 'minutes' ? 'mnt' : ''}
              </span>
            </div>
            <ProgressBar value={percent} tone={met ? 'success' : 'primary'} size="sm" className="mt-1.5" />
          </div>
        ))}
      </div>

      <div
        className={cn(
          'mt-4 flex items-center gap-3 rounded-xl border px-4 py-3',
          summary.allMet ? 'border-success/40 bg-success-soft' : 'border-line bg-surface-2',
        )}
      >
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-xl',
            summary.allMet ? 'bg-success/20 text-success' : 'bg-surface-3 text-ink-muted',
          )}
        >
          <Gift className="size-4.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-medium text-ink">
            {summary.allMet ? 'Bonus harian diklaim' : 'Bonus harian menunggu'}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">
            +{XP_REWARDS.dailyGoalBonus} XP dan +25 coins saat seluruh goal tercapai pada hari yang sama.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-wider text-ink-muted">
          7 hari terakhir
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {history.map((h) => (
            <div
              key={h.key}
              title={`${h.met}/${h.total} goal tercapai`}
              className={cn(
                'rounded-lg border px-1 py-2 text-center',
                h.met === h.total
                  ? 'border-success/40 bg-success-soft'
                  : h.met > 0
                    ? 'border-warning/40 bg-warning-soft'
                    : 'border-line bg-surface-2',
                h.isToday && 'ring-2 ring-primary/50',
              )}
            >
              <span className="block text-[10.5px] text-ink-muted">
                {h.date.toLocaleDateString('id-ID', { weekday: 'narrow' })}
              </span>
              <span className="mt-0.5 block text-[12px] font-semibold tabular-nums text-ink-soft">
                {h.met}/{h.total}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}
