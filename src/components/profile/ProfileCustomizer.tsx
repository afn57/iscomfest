import { useState } from 'react'
import { Lock } from 'lucide-react'
import { AVATARS, BACKGROUNDS, BANNERS, PROFILE_THEMES } from '../../data/mock/profile'
import { isRewardRedeemed } from '../../services/actions'
import { useProfileStore } from '../../store/useProfileStore'
import { toast } from '../../store/useToastStore'
import { cn } from '../../utils/cn'
import { Avatar, Panel, Tabs } from '../common'

type TabId = 'avatar' | 'banner' | 'theme' | 'background'

const TABS = [
  { id: 'avatar', label: 'Avatar' },
  { id: 'banner', label: 'Banner' },
  { id: 'theme', label: 'Accent' },
  { id: 'background', label: 'Background' },
]

export function ProfileCustomizer() {
  const profile = useProfileStore((s) => s.profile)
  const update = useProfileStore((s) => s.update)
  const [tab, setTab] = useState<TabId>('avatar')

  const avatarUnlocked = isRewardRedeemed('rw_avatar_1') || isRewardRedeemed('rw_avatar_2')
  const themeUnlocked = isRewardRedeemed('rw_theme')

  const lock = (label: string) =>
    toast.info('Item terkunci', `${label} bisa dibuka di halaman Rewards dengan coins.`)

  const pick = <K extends 'avatarId' | 'bannerId' | 'themeId' | 'backgroundId'>(
    key: K,
    value: string,
  ) => update({ [key]: value } as never)

  return (
    <Panel
      title="Kustomisasi profil"
      description="Item bertanda gembok dibuka lewat penukaran reward."
      action={
        <span className="text-[12.5px] text-ink-muted">
          {avatarUnlocked ? 'Avatar premium aktif' : '1 avatar premium terkunci'}
        </span>
      }
    >
      <Tabs items={TABS} value={tab} onChange={(v) => setTab(v as TabId)} />

      <div className="mt-4">
        {tab === 'avatar' && (
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
            {AVATARS.map((a) => {
              const locked = !!a.premium && !avatarUnlocked
              const active = profile.avatarId === a.id
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => (locked ? lock(a.label) : pick('avatarId', a.id))}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-colors',
                    active ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong',
                    locked && 'opacity-70',
                  )}
                >
                  <Avatar avatarId={a.id} name={a.label} size="md" />
                  <span className="truncate text-[11px] text-ink-muted">{a.label}</span>
                  {locked && (
                    <span className="absolute right-1.5 top-1.5 rounded-md bg-surface-3 p-1 text-ink-muted">
                      <Lock className="size-3" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {tab === 'banner' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BANNERS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => pick('bannerId', b.id)}
                className={cn(
                  'overflow-hidden rounded-xl border text-left transition-colors',
                  profile.bannerId === b.id ? 'border-primary ring-2 ring-primary/40' : 'border-line hover:border-line-strong',
                )}
              >
                <span className="block h-14" style={{ backgroundImage: b.css }} />
                <span className="block px-3 py-2 text-[12.5px] text-ink-soft">{b.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === 'theme' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PROFILE_THEMES.map((t, i) => {
              const locked = i >= 3 && !themeUnlocked
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => (locked ? lock(t.label) : pick('themeId', t.id))}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors',
                    profile.themeId === t.id ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong',
                    locked && 'opacity-70',
                  )}
                >
                  <span
                    className="size-8 shrink-0 rounded-lg border border-white/20"
                    style={{ backgroundColor: t.accent }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-ink">{t.label}</span>
                    <span className="block text-[11.5px] text-ink-muted">{t.accent}</span>
                  </span>
                  {locked && <Lock className="size-3.5 shrink-0 text-ink-muted" />}
                </button>
              )
            })}
          </div>
        )}

        {tab === 'background' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => pick('backgroundId', b.id)}
                className={cn(
                  'overflow-hidden rounded-xl border text-left transition-colors',
                  profile.backgroundId === b.id
                    ? 'border-primary ring-2 ring-primary/40'
                    : 'border-line hover:border-line-strong',
                )}
              >
                <span
                  className="block h-14 border-b border-line"
                  style={{ backgroundImage: b.css }}
                />
                <span className="block px-3 py-2 text-[12.5px] text-ink-soft">{b.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Panel>
  )
}
