import { PageHeader } from '../components/common'
import { CoinsCard } from '../components/rewards/CoinsCard'
import { RewardGrid } from '../components/rewards/RewardGrid'
import { RedemptionHistory } from '../components/rewards/RedemptionHistory'

export function RewardsPage() {
  return (
    <>
      <PageHeader
        title="Rewards"
        description="Tukarkan coins dari aktivitas produktif dengan kustomisasi profil eksklusif."
        crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Rewards' }]}
      />

      <div className="space-y-4 sm:space-y-5">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)]">
          <CoinsCard />
          <RewardGrid />
        </div>

        <RedemptionHistory />
      </div>
    </>
  )
}
