import { Info } from 'lucide-react';
import { PageHeader } from '../components/common';
import { AppearanceSettings, FocusSettings, PrivacySettings } from '../components/settings/SettingsPanels';
import { DataSettings } from '../components/settings/DataSettings';
export function SettingsPage() {
    return (<>
      <PageHeader title="Settings" description="Tampilan, preferensi fokus, privasi, dan pengelolaan data lokal." crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'Settings' }]}/>

      <div className="space-y-4 sm:space-y-5">
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
          <AppearanceSettings />
          <FocusSettings />
        </div>

        <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <PrivacySettings />
          <DataSettings />
        </div>

        <div className="flex items-start gap-3 rounded-card border border-line bg-surface px-4 py-4 shadow-card">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <Info className="size-4"/>
          </span>
          <div>
            <p className="text-[13.5px] font-medium text-ink">FOCUSLY v1.0 — aplikasi demo frontend</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
              React 19 · Vite · Tailwind CSS · Zustand. Seluruh data dan notifikasi
              disimulasikan di dalam browser tanpa backend.
            </p>
          </div>
        </div>
      </div>
    </>);
}
