import { useSearchParams } from 'react-router-dom';
import { Flame, User } from 'lucide-react';
import { PageHeader, Tabs } from '../components/common';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileStats } from '../components/profile/ProfileStats';
import { StreakStrip, ActivityFeed } from '../components/dashboard/Panels';
import { StatusDonut } from '../components/dashboard/Charts';
import { FocusSummary } from '../components/dashboard/FocusSummary';
import { StreakPanel } from '../components/gamification/StreakPanel';
import { FocusHeatmap } from '../components/gamification/FocusHeatmap';
import { DailyGoalsPanel } from '../components/gamification/DailyGoalsPanel';
import { RestDayManager } from '../components/gamification/RestDayManager';
const VIEWS = [
    { id: 'profile', label: 'Profile', icon: <User /> },
    { id: 'streak', label: 'My Streak', icon: <Flame /> },
];
export function ProfilePage() {
    const [params, setParams] = useSearchParams();
    const view = params.get('view') === 'streak' ? 'streak' : 'profile';
    const setView = (id) => {
        const next = new URLSearchParams(params);
        if (id === 'profile')
            next.delete('view');
        else
            next.set('view', id);
        setParams(next, { replace: true });
    };
    return (<>
      <PageHeader title={view === 'streak' ? 'My Streak' : 'Profile'} description={view === 'streak'
            ? 'Konsistensi belajar, riwayat aktivitas produktif, dan jadwal istirahatmu.'
            : 'Statistik, informasi, dan tampilan profil kamu.'} crumbs={[{ label: 'FlowState', to: '/dashboard' }, { label: view === 'streak' ? 'My Streak' : 'Profile' }]} actions={<Tabs items={VIEWS} value={view} onChange={setView} scroll={false}/>}/>

      {view === 'profile' ? (<div className="space-y-4 sm:space-y-5">
          <ProfileHeader />
          <ProfileStats />

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
            <div className="min-w-0 space-y-4 sm:space-y-5 lg:col-span-2 lg:flex lg:flex-col lg:[&>*]:grow">
              <StreakStrip />
              <FocusSummary />
            </div>
            <div className="min-w-0 space-y-4 sm:space-y-5 lg:flex lg:flex-col lg:[&>*]:grow">
              <StatusDonut />
            </div>
          </div>
        </div>) : (<div className="space-y-4 sm:space-y-5">
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <StreakPanel />
            <FocusHeatmap />
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <DailyGoalsPanel />
            <ActivityFeed />
          </div>

          <RestDayManager />
        </div>)}
    </>);
}
