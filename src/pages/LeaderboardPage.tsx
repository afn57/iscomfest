import { PageHeader } from '../components/common'
import { SelfSummary } from '../components/leaderboard/SelfSummary'
import { LeaderboardBoard } from '../components/leaderboard/LeaderboardBoard'

export function LeaderboardPage() {
  return (
    <>
      <PageHeader
        title="Leaderboard"
        description="Bandingkan progres dengan teman. Peringkat memakai data lokal kamu dan data simulasi."
        crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Leaderboard' }]}
      />

      <div className="space-y-4 sm:space-y-5">
        <SelfSummary />
        <LeaderboardBoard />
      </div>
    </>
  )
}
