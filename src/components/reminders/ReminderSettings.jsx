import { BellRing, Info, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Panel, Toggle } from '../common';
const ITEMS = [
    {
        key: 'deadlines',
        label: 'Pengingat deadline',
        description: 'Notifikasi saat tugas jatuh tempo hari ini atau besok.',
    },
    {
        key: 'overdue',
        label: 'Tugas terlambat',
        description: 'Peringatan ketika deadline sudah terlewat dan belum selesai.',
    },
    {
        key: 'focusReminders',
        label: 'Jadwal fokus',
        description: 'Pengingat 30 menit sebelum sesi fokus terjadwal dimulai.',
    },
    {
        key: 'streakWarnings',
        label: 'Peringatan streak',
        description: 'Pengingat pukul 20.00 ketika streak hari ini masih terancam.',
    },
    {
        key: 'dailyDigest',
        label: 'Ringkasan harian',
        description: 'Rangkuman aktivitas dikirim pukul 21.00 setiap hari.',
    },
];
export function ReminderSettings() {
    const notifications = useSettingsStore((s) => s.settings.notifications);
    const updateSection = useSettingsStore((s) => s.updateSection);
    const activeCount = ITEMS.filter((i) => notifications[i.key]).length;
    return (<div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <Panel title="Kategori pengingat" description={`${activeCount} dari ${ITEMS.length} kategori aktif.`}>
        <div className="space-y-0">
          {ITEMS.map((item) => (<div key={item.key} className={item.key === ITEMS[0].key ? '' : 'border-t border-line'}>
              <Toggle checked={notifications[item.key]} onChange={(v) => updateSection('notifications', { [item.key]: v })} label={item.label} description={item.description}/>
            </div>))}
        </div>
      </Panel>

      <div className="space-y-4 sm:space-y-5">
        <div className="flex items-start gap-2.5 rounded-card border border-line bg-surface px-4 py-3.5 shadow-card">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
            <BellRing className="size-4"/>
          </span>
          <div>
            <p className="text-[13.5px] font-medium text-ink">Hanya di dalam aplikasi</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
              Semua pengingat disimulasikan di browser: tidak ada push server, service worker, atau
              email. Notifikasi muncul di panel lonceng topbar.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-card border border-accent/30 bg-accent-soft px-4 py-3.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
            <Sparkles className="size-4"/>
          </span>
          <div>
            <p className="text-[13.5px] font-medium text-ink">Mesin pengingat berjalan otomatis</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
              Setiap 45 detik aplikasi mengecek deadline, jadwal fokus, dan kondisi streak —
              hanya kategori yang aktif yang akan dikirim.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-card border border-line bg-surface-2 px-4 py-3.5">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-muted"/>
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            Pengingat tetap tersimpan di localStorage, jadi tidak akan muncul ulang dua kali
            untuk kejadian yang sama dalam 12 jam.
          </p>
        </div>
      </div>
    </div>);
}
