import { GreetingHeader } from '../components/dashboard/GreetingHeader';
import { ProductivityChart, StatusDonut, TodayProgress } from '../components/dashboard/Charts';
import { TodayTaskList, UpcomingDeadlines } from '../components/dashboard/TaskPanels';
import { ActivityFeed, DailyGoalsWidget, QuickStats, StreakStrip, } from '../components/dashboard/Panels';
import { FocusSummary } from '../components/dashboard/FocusSummary';
import { CardSkeleton, Panel, Skeleton } from '../components/common';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';
function DashboardSkeleton() {
    return (<div className="space-y-4 sm:space-y-5">
      <div className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full"/>
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-6 w-64"/>
            <Skeleton className="h-3.5 w-44"/>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full"/>
              <Skeleton className="h-5 w-24 rounded-full"/>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-5 lg:col-span-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-4 sm:space-y-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>);
}
export function DashboardPage() {
    const loading = useSimulatedLoading(380);
    if (loading)
        return <DashboardSkeleton />;
    return (<div className="space-y-4 sm:space-y-5">
      <GreetingHeader />
      <QuickStats />

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="min-w-0 space-y-4 sm:space-y-5 lg:col-span-2 lg:flex lg:flex-col lg:[&>*]:grow">
          <TodayTaskList />
          <ProductivityChart />
          <FocusSummary />
        </div>
        <div className="min-w-0 space-y-4 sm:space-y-5 lg:flex lg:flex-col lg:[&>*]:grow">
          <TodayProgress />
          <DailyGoalsWidget />
          <StreakStrip />
          <StatusDonut />
        </div>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2 lg:flex lg:flex-col lg:[&>*]:grow">
          <ActivityFeed />
        </div>
        <UpcomingDeadlines />
      </div>

      <Panel title="Catatan singkat" description="Bagaimana angka di atas seharusnya dibaca." className="border-dashed">
        <ul className="space-y-2 text-[13px] leading-relaxed text-ink-muted">
          <li>
            • Streak bertambah hanya ketika kamu <strong className="text-ink-soft">menyelesaikan</strong> aktivitas
            (sesi fokus dengan DND, daily goal, atau tugas) — bukan sekadar menekan Start.
          </li>
          <li>
            • Angka fokus dan tugas dihitung dari data lokal di browser kamu dan tersimpan di
            localStorage.
          </li>
          <li>
            • FOCUSLY saat ini berjalan sebagai aplikasi frontend. Integrasi backend dan
            browser extension untuk Focus Lock disiapkan pada tahap berikutnya.
          </li>
        </ul>
      </Panel>
    </div>);
}
