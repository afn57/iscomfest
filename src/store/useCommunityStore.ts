import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Comment, Post } from '../types'
import { SEED_POSTS } from '../data/mock/social'
import { uid } from '../utils/id'

interface CommunityState {
  posts: Post[]
  addPost: (input: { category: string; title: string; body: string; authorId: string }) => Post
  toggleLike: (postId: string) => void
  addComment: (postId: string, body: string, authorId: string) => Comment | null
  share: (postId: string) => void
  removePost: (postId: string) => void
  reset: () => void
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      posts: SEED_POSTS,

      addPost: (input) => {
        const post: Post = {
          id: uid('post'),
          authorId: input.authorId,
          category: input.category,
          title: input.title.trim(),
          body: input.body.trim(),
          at: new Date().toISOString(),
          likes: 0,
          likedByMe: false,
          comments: [],
          shares: 0,
        }
        set((s) => ({ posts: [post, ...s.posts] }))
        return post
      },

      toggleLike: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId
              ? { ...p, likedByMe: !p.likedByMe, likes: p.likes + (p.likedByMe ? -1 : 1) }
              : p,
          ),
        })),

      addComment: (postId, body, authorId) => {
        const text = body.trim()
        if (!text) return null
        const comment: Comment = {
          id: uid('c'),
          authorId,
          body: text,
          at: new Date().toISOString(),
        }
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === postId ? { ...p, comments: [...p.comments, comment] } : p,
          ),
        }))
        return comment
      },

      share: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) => (p.id === postId ? { ...p, shares: p.shares + 1 } : p)),
        })),

      removePost: (postId) =>
        set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) })),

      reset: () => set({ posts: SEED_POSTS }),
    }),
    { name: 'focusly_community', version: 1 },
  ),
)
