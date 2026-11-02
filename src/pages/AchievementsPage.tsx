import { PageHeader } from '../components/common'
import { LevelCard } from '../components/gamification/LevelCard'
import { StreakPanel } from '../components/gamification/StreakPanel'
import { DailyGoalsPanel } from '../components/gamification/DailyGoalsPanel'
import { AchievementGrid } from '../components/gamification/AchievementGrid'
import { RestDayManager } from '../components/gamification/RestDayManager'
import { FocusHeatmap } from '../components/gamification/FocusHeatmap'

export function AchievementsPage() {
  return (
    <>
      <PageHeader
        title="Achievement & Rest Day"
        description="Pantau streak, daily goal, badge, dan jadwal istirahat yang tetap menjaga ritme."
        crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Achievement' }]}
      />

      <div className="space-y-4 sm:space-y-5">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <LevelCard />
          <StreakPanel />
        </div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <DailyGoalsPanel />
          <FocusHeatmap />
        </div>

        <AchievementGrid />
        <RestDayManager />
      </div>
    </>
  )
}
