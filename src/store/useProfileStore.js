import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_PROFILE } from '../data/mock/profile';
export const useProfileStore = create()(persist((set) => ({
    profile: DEFAULT_PROFILE,
    update: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
    reset: () => set({ profile: DEFAULT_PROFILE }),
}), { name: 'focusly_profile', version: 1 }));
