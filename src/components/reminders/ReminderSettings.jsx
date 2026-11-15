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
    return (<Panel title="Kategori pengingat" description={`${activeCount} dari ${ITEMS.length} kategori aktif.`}>
      <div className="space-y-0">
        {ITEMS.map((item) => (<div key={item.key} className={item.key === ITEMS[0].key ? '' : 'border-t border-line'}>
            <Toggle checked={notifications[item.key]} onChange={(v) => updateSection('notifications', { [item.key]: v })} label={item.label} description={item.description}/>
          </div>))}
      </div>
    </Panel>);
}
