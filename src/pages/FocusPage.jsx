import { useSearchParams } from 'react-router-dom';
import { CalendarClock, Crosshair, History } from 'lucide-react';
import { PageHeader, Tabs } from '../components/common';
import { SessionPanel } from '../components/focus/SessionPanel';
import { RestrictedApps } from '../components/focus/RestrictedApps';
import { AutoLockCard } from '../components/focus/AutoLockCard';
import { SchedulePanel } from '../components/focus/SchedulePanel';
import { FocusHistory } from '../components/focus/FocusHistory';
const TABS = [
    { id: 'session', label: 'Session', icon: <Crosshair /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarClock /> },
    { id: 'history', label: 'History', icon: <History /> },
];
export function FocusPage() {
    const [params, setParams] = useSearchParams();
    const raw = params.get('tab');
    const tab = TABS.some((t) => t.id === raw) ? raw : 'session';
    const setTab = (id) => {
        const next = new URLSearchParams(params);
        next.set('tab', id);
        setParams(next, { replace: true });
    };
    return (<>
      <PageHeader title="Focus Mode" description="Sesi fokus minim distraksi dan simulasi Focus Lock untuk menjaga konsistensi." crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Focus Mode' }]}/>

      <div className="mb-4 overflow-x-auto no-scrollbar sm:mb-5">
        <Tabs items={TABS} value={tab} onChange={setTab}/>
      </div>

      {tab === 'session' && (<div className="space-y-4 sm:space-y-5">
          <SessionPanel />
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <RestrictedApps />
            <AutoLockCard />
          </div>
        </div>)}

      {tab === 'schedule' && (<div className="space-y-4 sm:space-y-5">
          <SchedulePanel />
          <AutoLockCard />
        </div>)}

      {tab === 'history' && <FocusHistory />}
    </>);
}
