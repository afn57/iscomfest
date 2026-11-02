import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Redemption } from '../types'
import { uid } from '../utils/id'

interface RewardState {
  redemptions: Redemption[]
  /** Records a redemption. Coins are handled by the caller/service. */
  add: (input: { rewardId: string; rewardName: string; cost: number }) => Redemption
  remove: (id: string) => void
  clearHistory: () => void
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set) => ({
      redemptions: [
        {
          id: uid('rdm'),
          rewardId: 'rw_avatar_2',
          rewardName: 'Exclusive Avatar — Deep Thinker',
          cost: 450,
          redeemedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
        },
      ],

      add: (input) => {
        const record: Redemption = { ...input, id: uid('rdm'), redeemedAt: new Date().toISOString() }
        set((s) => ({ redemptions: [record, ...s.redemptions] }))
        return record
      },

      remove: (id) =>
        set((s) => ({ redemptions: s.redemptions.filter((r) => r.id !== id) })),

      clearHistory: () => set({ redemptions: [] }),
    }),
    { name: 'focusly_rewards', version: 1 },
  ),
)
