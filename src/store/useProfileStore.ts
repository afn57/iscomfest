import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '../types'
import { DEFAULT_PROFILE } from '../data/mock/profile'

interface ProfileState {
  profile: Profile
  update: (patch: Partial<Profile>) => void
  setShowcase: (ids: string[]) => void
  reset: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      update: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      setShowcase: (ids) =>
        set((s) => ({ profile: { ...s.profile, showcase: ids.slice(0, 3) } })),
      reset: () => set({ profile: DEFAULT_PROFILE }),
    }),
    { name: 'focusly_profile', version: 1 },
  ),
)
