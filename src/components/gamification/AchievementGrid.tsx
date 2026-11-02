import { useMemo, useState } from 'react'
import { Lock, RefreshCw, Trophy } from 'lucide-react'
import type { Achievement } from '../../types'
import { ACHIEVEMENTS } from '../../data/mock/gamification'
import { evaluateAchievements } from '../../services/gamification'
import { useProgressStore } from '../../store/useProgressStore'
import { toast } from '../../store/useToastStore'
import { cn } from '../../utils/cn'
import { formatShort } from '../../utils/date'
import { Badge, Button, IconByName, Panel } from '../common'

const TIER_TONE: Record<Achievement['tier'], { chip: string; label: string }> = {
  bronze: { chip: 'bg-warning-soft text-warning', label: 'Bronze' },
  silver: { chip: 'bg-surface-3 text-ink-soft', label: 'Silver' },
  gold: { chip: 'bg-accent-soft text-accent', label: 'Gold' },
}

type Filter = 'all' | 'unlocked' | 'locked'

export function AchievementGrid() {
  const unlocked = useProgressStore((s) => s.progress.unlocked)
  const [filter, setFilter] = useState<Filter>('all')
  const [checking, setChecking] = useState(false)

  const unlockedMap = useMemo(
    () => new Map(unlocked.map((u) => [u.id, u.unlockedAt])),
    [unlocked],
  )

  const list = ACHIEVEMENTS.filter((a) => {
    const has = unlockedMap.has(a.id)
    if (filter === 'unlocked') return has
    if (filter === 'locked') return !has
    return true
  })

  const check = () => {
    setChecking(true)
    window.setTimeout(() => {
      const fresh = evaluateAchievements()
      setChecking(false)
      if (fresh.length > 0) {
        toast.success(
          `${fresh.length} achievement terbuka!`,
          fresh.map((f) => f.name).join(', '),
        )
      } else {
        toast.info('Belum ada pencapaian baru', 'Teruskan streak dan sesi fokus kamu.')
      }
    }, 320)
  }

  return (
    <Panel
      title="Achievements"
      description={`${unlockedMap.size} dari ${ACHIEVEMENTS.length} terbuka.`}
      action={
        <Button size="sm" variant="outline" icon={<RefreshCw />} loading={checking} onClick={check}>
          Cek pencapaian
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(
          [
            ['all', 'Semua'],
            ['unlocked', 'Terbuka'],
            ['locked', 'Terkunci'],
          ] as Array<[Filter, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              'rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors',
              filter === id
                ? 'border-primary bg-primary-soft text-primary'
                : 'border-line text-ink-muted hover:border-line-strong hover:text-ink-soft',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const at = unlockedMap.get(a.id)
          const tier = TIER_TONE[a.tier]
          return (
            <div
              key={a.id}
              className={cn(
                'relative overflow-hidden rounded-xl border p-4 transition-colors',
                at ? 'border-line bg-surface' : 'border-dashed border-line bg-surface-2/60',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    at ? tier.chip : 'bg-surface-3 text-ink-muted',
                  )}
                >
                  {at ? <IconByName name={a.icon} /> : <Lock className="size-4.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-[13.5px] font-semibold', at ? 'text-ink' : 'text-ink-muted')}>
                      {a.name}
                    </p>
                    <Badge tone="outline" className={cn('shrink-0', at ? tier.chip : 'opacity-60')}>
                      {tier.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{a.description}</p>
                  <p className="mt-2 text-[11.5px] text-ink-muted/80">
                    {at ? `Dibuka ${formatShort(at)}` : `Syarat: ${a.requirement}`}
                  </p>
                </div>
              </div>

              {at && (
                <span className="absolute -right-6 -top-6 size-16 rounded-full bg-primary/10" aria-hidden />
              )}
            </div>
          )
        })}
      </div>

      {list.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Trophy className="size-6 text-ink-muted" />
          <p className="text-[13.5px] text-ink-soft">Tidak ada achievement pada filter ini.</p>
          <p className="text-[12.5px] text-ink-muted">Selesaikan sesi fokus untuk membuka yang pertama.</p>
        </div>
      )}
    </Panel>
  )
}
