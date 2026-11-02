import { Check, Lock, Medal } from 'lucide-react'
import { ACHIEVEMENTS } from '../../data/mock/gamification'
import { useProfileStore } from '../../store/useProfileStore'
import { useProgressStore } from '../../store/useProgressStore'
import { toast } from '../../store/useToastStore'
import { cn } from '../../utils/cn'
import { formatShort } from '../../utils/date'
import { Badge, IconByName, Panel } from '../common'

export function ShowcasePicker() {
  const showcase = useProfileStore((s) => s.profile.showcase)
  const setShowcase = useProfileStore((s) => s.setShowcase)
  const unlocked = useProgressStore((s) => s.progress.unlocked)

  const unlockedIds = new Set(unlocked.map((u) => u.id))
  const unlockedAt = new Map(unlocked.map((u) => [u.id, u.unlockedAt]))

  const toggle = (id: string) => {
    if (showcase.includes(id)) {
      setShowcase(showcase.filter((x) => x !== id))
      return
    }
    if (showcase.length >= 3) {
      toast.info('Showcase penuh', 'Lepas salah satu badge dulu (maksimal 3).')
      return
    }
    setShowcase([...showcase, id])
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <Panel
        title="Showcase"
        description="Pilih maksimal 3 achievement untuk ditampilkan di profil kamu."
        action={<Badge tone="primary">{showcase.length}/3 terpasang</Badge>}
      >
        <div className="grid gap-2.5 sm:grid-cols-3">
          {[0, 1, 2].map((slot) => {
            const id = showcase[slot]
            const achievement = ACHIEVEMENTS.find((a) => a.id === id)
            if (!achievement) {
              return (
                <div
                  key={slot}
                  className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line px-3 py-4 text-center"
                >
                  <Lock className="size-4 text-ink-muted" />
                  <span className="text-[12px] text-ink-muted">Slot kosong</span>
                </div>
              )
            }
            return (
              <div
                key={slot}
                className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary-soft px-3.5 py-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
                  <IconByName name={achievement.icon} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">{achievement.name}</p>
                  <p className="truncate text-[11.5px] text-ink-muted">
                    {unlockedAt.get(achievement.id)
                      ? `Dibuka ${formatShort(unlockedAt.get(achievement.id)!)}`
                      : achievement.requirement}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel
        title="Achievement kamu"
        description="Klik untuk memasang atau melepas dari showcase."
        action={<Medal className="size-4 text-warning" />}
      >
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {ACHIEVEMENTS.map((a) => {
            const has = unlockedIds.has(a.id)
            const active = showcase.includes(a.id)
            return (
              <button
                key={a.id}
                type="button"
                disabled={!has}
                onClick={() => toggle(a.id)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                  active
                    ? 'border-primary bg-primary-soft'
                    : has
                      ? 'border-line hover:border-primary/50'
                      : 'border-dashed border-line bg-surface-2/60 opacity-70',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    has ? 'bg-warning-soft text-warning' : 'bg-surface-3 text-ink-muted',
                  )}
                >
                  {has ? <IconByName name={a.icon} /> : <Lock className="size-3.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-[13px] font-medium', has ? 'text-ink' : 'text-ink-muted')}>
                    {a.name}
                  </span>
                  <span className="block truncate text-[11.5px] text-ink-muted">{a.requirement}</span>
                </span>
                {active && <Check className="size-4 shrink-0 text-primary" />}
              </button>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
