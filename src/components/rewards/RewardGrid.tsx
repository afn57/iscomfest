import { useMemo, useState } from 'react'
import { Check, Coins, Lock } from 'lucide-react'
import type { Reward } from '../../types'
import { REWARDS } from '../../data/mock/social'
import { redeemReward } from '../../services/actions'
import { useProgressStore } from '../../store/useProgressStore'
import { useRewardStore } from '../../store/useRewardStore'
import { cn } from '../../utils/cn'
import { Badge, Button, ConfirmDialog, IconByName, Panel } from '../common'

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'Semua' },
  { id: 'theme', label: 'Theme' },
  { id: 'avatar', label: 'Avatar' },
  { id: 'badge', label: 'Badge' },
  { id: 'frame', label: 'Frame' },
  { id: 'background', label: 'Background' },
]

export function RewardGrid() {
  const coins = useProgressStore((s) => s.progress.coins)
  const redemptions = useRewardStore((s) => s.redemptions)
  const [category, setCategory] = useState('all')
  const [target, setTarget] = useState<Reward | null>(null)

  const list = useMemo(
    () => (category === 'all' ? REWARDS : REWARDS.filter((r) => r.category === category)),
    [category],
  )

  const confirm = () => {
    if (!target) return
    redeemReward(target)
    setTarget(null)
  }

  return (
    <>
      <Panel
        title="Katalog reward"
        description={`${REWARDS.length} item tersedia · kategori ${CATEGORIES.find((c) => c.id === category)?.label}.`}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1 text-[12.5px] font-medium text-warning tabular-nums">
            <Coins className="size-3.5" /> {coins} coins
          </span>
        }
      >
        <div className="mb-4 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors',
                category === c.id
                  ? 'border-primary bg-primary-soft text-primary'
                  : 'border-line text-ink-muted hover:border-line-strong hover:text-ink-soft',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => {
            const owned = redemptions.some((x) => x.rewardId === r.id)
            const affordable = coins >= r.cost
            return (
              <div
                key={r.id}
                className={cn(
                  'flex flex-col rounded-xl border p-4 transition-colors',
                  owned ? 'border-success/40 bg-success-soft/40' : 'border-line bg-surface',
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-xl',
                      owned ? 'bg-success/20 text-success' : 'bg-primary-soft text-primary',
                    )}
                  >
                    <IconByName name={r.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13.5px] font-semibold leading-snug text-ink">{r.name}</p>
                      {owned && (
                        <Badge tone="success" className="shrink-0">
                          <Check className="size-3" /> Dimiliki
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{r.description}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="flex items-center gap-1.5 text-[13.5px] font-semibold tabular-nums text-warning">
                    <Coins className="size-4" /> {r.cost}
                  </span>
                  {owned ? (
                    <Button size="sm" variant="outline" disabled icon={<Lock />}>
                      Sudah diklaim
                    </Button>
                  ) : affordable ? (
                    <Button size="sm" variant="primary" onClick={() => setTarget(r)}>
                      Tukar sekarang
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Kurang {r.cost - coins}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      <ConfirmDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={confirm}
        title="Tukarkan reward ini?"
        confirmLabel="Tukarkan"
        body={
          target ? (
            <div className="space-y-2">
              <p>
                <span className="font-medium text-ink">{target.name}</span> akan diklaim dengan{' '}
                <span className="font-medium text-warning">{target.cost} coins</span>.
              </p>
              <p className="text-[12.5px] text-ink-muted">
                Sisa coins kamu setelah penukaran:{' '}
                <span className="font-medium text-ink-soft">{coins - target.cost}</span>. Penukaran
                tidak dapat dibatalkan di aplikasi ini.
              </p>
            </div>
          ) : null
        }
      />
    </>
  )
}
