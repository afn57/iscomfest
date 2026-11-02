import { Link } from 'react-router-dom'
import { ChevronRight, MessagesSquare, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import { useCommunityStore } from '../../store/useCommunityStore'
import { categoryStats, topContributors } from '../../services/community'
import { cn } from '../../utils/cn'
import { Avatar, Panel } from '../common'

interface CommunitySidebarProps {
  active: string
  onSelect: (category: string) => void
}

export function CommunitySidebar({ active, onSelect }: CommunitySidebarProps) {
  const posts = useCommunityStore((s) => s.posts)

  const stats = categoryStats(posts)
  const contributors = topContributors(posts)

  return (
    <div className="space-y-4">
      <Panel title="Kategori populer" description="Berdasarkan total suka." action={<TrendingUp className="size-4 text-success" />}>
        <div className="space-y-1">
          {stats.slice(0, 5).map((s) => (
            <button
              key={s.category}
              type="button"
              onClick={() => onSelect(s.category)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors',
                active === s.category
                  ? 'bg-primary-soft text-primary'
                  : 'text-ink-soft hover:bg-surface-2 hover:text-ink',
              )}
            >
              <span className="truncate">{s.category}</span>
              <span className="shrink-0 text-[12px] tabular-nums text-ink-muted">
                {s.posts} post · {s.likes} ♥
              </span>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Kontributor teratas" description="Penulis paling disukai minggu ini." action={<Users className="size-4 text-primary" />}>
        <ul className="space-y-2.5">
          {contributors.map((c, i) => (
            <li key={c.author.id} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md text-[11px] font-bold',
                  i === 0 ? 'bg-warning-soft text-warning' : 'bg-surface-3 text-ink-muted',
                )}
              >
                {i + 1}
              </span>
              <Avatar avatarId={c.author.avatarId} name={c.author.displayName} size="xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-ink">
                  {c.author.id === 'self' ? 'Kamu' : c.author.displayName}
                </p>
                <p className="text-[11.5px] text-ink-muted">
                  {c.posts} postingan · {c.likes} suka
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Aturan singkat" description="Jaga diskusi tetap berguna." action={<ShieldCheck className="size-4 text-accent" />}>
        <ul className="space-y-2 text-[12.5px] leading-relaxed text-ink-muted">
          <li className="flex gap-2">
            <span className="text-primary">1.</span> Bagikan strategi yang benar-benar kamu pakai.
          </li>
          <li className="flex gap-2">
            <span className="text-primary">2.</span> Kritik cara, bukan orang.
          </li>
          <li className="flex gap-2">
            <span className="text-primary">3.</span> No spam promosi atau tautan afiliasi.
          </li>
          <li className="flex gap-2">
            <span className="text-primary">4.</span> Hormati privasi — jangan bagikan data kuliah orang lain.
          </li>
        </ul>

        <Link
          to="/focus"
          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-primary-soft px-3 py-2 text-[12.5px] font-medium text-primary transition-colors hover:bg-primary hover:text-white"
        >
          <MessagesSquare className="size-3.5" /> Selesai membaca? Mulai sesi fokus
          <ChevronRight className="size-3.5" />
        </Link>
      </Panel>
    </div>
  )
}
