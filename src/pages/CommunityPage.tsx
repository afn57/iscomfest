import { useMemo, useState } from 'react'
import { Inbox } from 'lucide-react'
import { POST_CATEGORIES } from '../data/mock/social'
import { useCommunityStore } from '../store/useCommunityStore'
import { EmptyState, PageHeader } from '../components/common'
import { PostComposer } from '../components/community/PostComposer'
import { PostCard } from '../components/community/PostCard'
import { CommunitySidebar } from '../components/community/CommunitySidebar'
import { cn } from '../utils/cn'

export function CommunityPage() {
  const posts = useCommunityStore((s) => s.posts)
  const [category, setCategory] = useState('Semua')

  const filtered = useMemo(
    () => (category === 'Semua' ? posts : posts.filter((p) => p.category === category)),
    [posts, category],
  )

  const categories = ['Semua', ...POST_CATEGORIES]

  return (
    <>
      <PageHeader
        title="Community"
        description="Ruang berbagi tips belajar, teknik fokus, dan kemenangan kecil antar pengguna."
        crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Community' }]}
      />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="space-y-4 sm:space-y-5">
          <PostComposer />

          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  'rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors',
                  category === c
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line text-ink-muted hover:border-line-strong hover:text-ink-soft',
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Inbox />}
              title={`Belum ada postingan di ${category}`}
              description="Jadilah yang pertama membagikan tips atau pertanyaan di kategori ini."
            />
          ) : (
            <div className="space-y-4">
              {filtered.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </div>

        <CommunitySidebar active={category} onSelect={setCategory} />
      </div>
    </>
  )
}
