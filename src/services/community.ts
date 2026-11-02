import { COMMUNITY_AUTHORS, type CommunityAuthor } from '../data/mock/social'
import { levelFromXp } from '../data/mock/gamification'
import { useProfileStore } from '../store/useProfileStore'
import { useProgressStore } from '../store/useProgressStore'
import type { Post } from '../types'

export function selfAuthor(): CommunityAuthor {
  const profile = useProfileStore.getState().profile
  const xp = useProgressStore.getState().progress.xp
  return {
    id: 'self',
    displayName: profile.displayName,
    username: profile.username,
    avatarId: profile.avatarId,
    level: levelFromXp(xp).level,
  }
}

export function authorOf(authorId: string): CommunityAuthor {
  if (authorId === 'self') return selfAuthor()
  return (
    COMMUNITY_AUTHORS.find((a) => a.id === authorId) ?? {
      id: authorId,
      displayName: 'Anggota FOCUSLY',
      username: 'member',
      avatarId: 'slate',
      level: 1,
    }
  )
}

export interface CategoryStat {
  category: string
  posts: number
  likes: number
}

export function categoryStats(posts: Post[]): CategoryStat[] {
  const map = new Map<string, CategoryStat>()
  for (const p of posts) {
    const stat = map.get(p.category) ?? { category: p.category, posts: 0, likes: 0 }
    stat.posts += 1
    stat.likes += p.likes
    map.set(p.category, stat)
  }
  return [...map.values()].sort((a, b) => b.likes - a.likes)
}

export function topContributors(posts: Post[]): Array<{ author: CommunityAuthor; posts: number; likes: number }> {
  const map = new Map<string, { author: CommunityAuthor; posts: number; likes: number }>()
  for (const p of posts) {
    const entry = map.get(p.authorId) ?? { author: authorOf(p.authorId), posts: 0, likes: 0 }
    entry.posts += 1
    entry.likes += p.likes
    map.set(p.authorId, entry)
  }
  return [...map.values()].sort((a, b) => b.likes - a.likes).slice(0, 5)
}
