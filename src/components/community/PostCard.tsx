import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Heart, MessageCircle, Share2, Send, Trash2 } from 'lucide-react'
import type { Post } from '../../types'
import { authorOf } from '../../services/community'
import { useCommunityStore } from '../../store/useCommunityStore'
import { cn } from '../../utils/cn'
import { relativeFromNow } from '../../utils/date'
import { Avatar, Badge, Button, Input } from '../common'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const toggleLike = useCommunityStore((s) => s.toggleLike)
  const share = useCommunityStore((s) => s.share)
  const addComment = useCommunityStore((s) => s.addComment)
  const removePost = useCommunityStore((s) => s.removePost)

  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const author = useMemo(() => authorOf(post.authorId), [post.authorId])
  const isMine = post.authorId === 'self'

  const comment = () => {
    if (!text.trim()) return
    addComment(post.id, text, 'self')
    setText('')
    setOpen(true)
  }

  return (
    <article className="rounded-card border border-line bg-surface px-4 py-4 shadow-card sm:px-5">
      <header className="flex items-start gap-3">
        <Avatar avatarId={author.avatarId} name={author.displayName} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[13.5px] font-semibold text-ink">{author.displayName}</span>
            <span className="text-[12px] text-ink-muted">@{author.username}</span>
            <Badge tone="accent">Lv {author.level}</Badge>
            <span className="text-[12px] text-ink-muted">· {relativeFromNow(post.at)}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge tone="primary">{post.category}</Badge>
            {isMine && <Badge tone="outline">Postingan kamu</Badge>}
          </div>
        </div>

        {isMine && (
          <button
            type="button"
            aria-label="Hapus postingan"
            onClick={() => removePost(post.id)}
            className="shrink-0 rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-danger"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </header>

      <div className="mt-3">
        <h3 className="font-display text-[15.5px] font-semibold leading-snug text-ink">{post.title}</h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{post.body}</p>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <ActionButton
          active={post.likedByMe}
          onClick={() => toggleLike(post.id)}
          icon={<Heart className={cn('size-4', post.likedByMe && 'fill-current')} />}
          label={String(post.likes)}
          activeClass="text-danger"
        />
        <ActionButton
          active={open}
          onClick={() => setOpen((v) => !v)}
          icon={<MessageCircle className="size-4" />}
          label={`${post.comments.length}`}
        />
        <ActionButton
          onClick={() => share(post.id)}
          icon={<Share2 className="size-4" />}
          label={`${post.shares}`}
        />
        <span className="ml-auto text-[11.5px] text-ink-muted">{post.authorId === 'self' ? 'kamu' : 'komunitas'}</span>
      </div>

      {open && (
        <div className="mt-3 space-y-2.5 rounded-xl bg-surface-2 px-3.5 py-3">
          {post.comments.length === 0 && (
            <p className="text-[12.5px] text-ink-muted">Belum ada komentar. Jadilah yang pertama.</p>
          )}

          {post.comments.map((c) => {
            const ca = authorOf(c.authorId)
            return (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar avatarId={ca.avatarId} name={ca.displayName} size="xs" />
                <div className="min-w-0 flex-1 rounded-lg bg-surface px-3 py-2">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <span className="text-[12.5px] font-medium text-ink">{ca.displayName}</span>
                    <span className="text-[11.5px] text-ink-muted">{relativeFromNow(c.at)}</span>
                  </div>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink-soft">{c.body}</p>
                </div>
              </div>
            )
          })}

          <div className="flex items-center gap-2 pt-1">
            <Input
              value={text}
              placeholder="Tulis komentar..."
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') comment()
              }}
            />
            <Button size="md" variant="primary" icon={<Send />} aria-label="Kirim komentar" onClick={comment} />
          </div>
        </div>
      )}
    </article>
  )
}

function ActionButton({
  icon,
  label,
  active,
  activeClass,
  onClick,
}: {
  icon: ReactNode
  label: string
  active?: boolean
  activeClass?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium transition-colors',
        active ? (activeClass ?? 'text-primary') : 'text-ink-muted hover:bg-surface-2 hover:text-ink-soft',
      )}
    >
      {icon}
      <span className="tabular-nums">{label}</span>
    </button>
  )
}
