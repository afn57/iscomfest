import { BellRing } from 'lucide-react';
import { PageHeader } from '../components/common';
import { ReminderSettings } from '../components/reminders/ReminderSettings';
import { UpcomingReminders } from '../components/reminders/UpcomingReminders';
export function RemindersPage() {
    return (<>
      <PageHeader title="Reminders" description="Atur kategori pengingat dan lihat jadwal mendatang." crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Reminders' }]} actions={<span className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[13px] text-ink-muted">
            <BellRing className="size-4 text-primary"/>
            Mode simulasi lokal
          </span>}/>

      <div className="space-y-4 sm:space-y-5">
        <ReminderSettings />
        <UpcomingReminders />
      </div>
    </>);
}
