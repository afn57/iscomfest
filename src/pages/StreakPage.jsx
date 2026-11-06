import { PageHeader } from '../components/common';
import { StreakPanel } from '../components/gamification/StreakPanel';
import { FocusHeatmap } from '../components/gamification/FocusHeatmap';
import { RestDayManager } from '../components/gamification/RestDayManager';
export function StreakPage() {
    return (<>
      <PageHeader title="Streak" description="Pantau streak harian, heatmap fokus, dan jadwal istirahat yang menjaga ritme." crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Streak' }]}/>

      <div className="space-y-4 sm:space-y-5">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
          <StreakPanel />
          <FocusHeatmap />
        </div>
        <RestDayManager />
      </div>
    </>);
}