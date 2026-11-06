import { Link } from 'react-router-dom';
import { BellRing, ChevronRight, Crosshair, EyeOff, LayoutPanelTop, Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { toast } from '../../store/useToastStore';
import { cn } from '../../utils/cn';
import { Button, Field, Input, Panel, Toggle } from '../common';
export function AppearanceSettings() {
    const settings = useSettingsStore((s) => s.settings);
    const update = useSettingsStore((s) => s.update);
    const setTheme = useSettingsStore((s) => s.setTheme);
    const activeNotifications = Object.values(settings.notifications).filter(Boolean).length;
    return (<Panel title="Tampilan" description="Tema dan perilaku antarmuka.">
      <div className="grid grid-cols-2 gap-3">
        {[
            ['dark', 'Dark', Moon],
            ['light', 'Light', Sun],
        ].map(([id, label, Icon]) => (<button key={id} type="button" onClick={() => setTheme(id)} className={cn('flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors', settings.theme === id
                ? 'border-primary bg-primary-soft'
                : 'border-line hover:border-line-strong')}>
            <span className={cn('flex size-8 items-center justify-center rounded-lg', settings.theme === id ? 'bg-primary/20 text-primary' : 'bg-surface-3 text-ink-muted')}>
              <Icon className="size-4"/>
            </span>
            <span className="min-w-0">
              <span className="block text-[13.5px] font-medium text-ink">{label}</span>
              <span className="block text-[11.5px] text-ink-muted">
                {id === 'dark' ? 'Nyaman untuk mata malam' : 'Terang dan bersih'}
              </span>
            </span>
          </button>))}
      </div>

      <div className="mt-4 border-t border-line">
        <Toggle checked={settings.compactSidebar} onChange={(v) => update({ compactSidebar: v })} label={<span className="inline-flex items-center gap-1.5">
              <LayoutPanelTop className="size-3.5"/> Sidebar ringkas
            </span>} description="Ikon saja di layar besar, teks muncul saat disorot."/>
        <div className="border-t border-line"/>
        <Toggle checked={settings.reduceMotion} onChange={(v) => update({ reduceMotion: v })} label="Kurangi animasi" description="Matikan transisi dan efek bergerak."/>
      </div>

      <Link to="/reminders" className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 transition-colors hover:border-primary/50">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <BellRing className="size-4"/>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-medium text-ink">Notifikasi</span>
          <span className="block text-[12px] text-ink-muted">
            {activeNotifications} kategori aktif · kelola di halaman Reminders
          </span>
        </span>
        <ChevronRight className="size-4 text-ink-muted"/>
      </Link>
    </Panel>);
}
export function FocusSettings() {
    const focus = useSettingsStore((s) => s.settings.focus);
    const restDay = useSettingsStore((s) => s.settings.restDay);
    const updateSection = useSettingsStore((s) => s.updateSection);
    const minutesError = focus.defaultMinutes < 5 || focus.defaultMinutes > 120 ? 'Antara 5 dan 120 menit.' : undefined;
    const hoursError = focus.autoLockThresholdHours < 1 || focus.autoLockThresholdHours > 72
        ? 'Antara 1 dan 72 jam.'
        : undefined;
    return (<Panel title="Preferensi fokus" description="Dipakai oleh Focus Mode dan simulasi Focus Lock." action={<Crosshair className="size-4 text-primary"/>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Durasi sesi default" hint="menit" error={minutesError}>
          <Input type="number" min={5} max={120} value={focus.defaultMinutes} onChange={(e) => updateSection('focus', {
            defaultMinutes: Math.min(120, Math.max(5, Number(e.target.value) || 5)),
        })}/>
        </Field>
        <Field label="Ambang auto-lock" hint="jam sebelum tenggat" error={hoursError}>
          <Input type="number" min={1} max={72} value={focus.autoLockThresholdHours} onChange={(e) => updateSection('focus', {
            autoLockThresholdHours: Math.min(72, Math.max(1, Number(e.target.value) || 1)),
        })}/>
        </Field>
      </div>

      <div className="mt-3 border-t border-line">
        <Toggle checked={focus.dndDefault} onChange={(v) => updateSection('focus', { dndDefault: v })} label="Do Not Disturb bawaan" description="Sesi baru langsung mengaktifkan mode gangguan minimum."/>
        <div className="border-t border-line"/>
        <Toggle checked={focus.autoLockEnabled} onChange={(v) => updateSection('focus', { autoLockEnabled: v })} label="Saran Focus Lock" description="Rekomendasikan kunci fokus saat tenggat mepet."/>
        <div className="border-t border-line"/>
        <Toggle checked={focus.showLockBanner} onChange={(v) => updateSection('focus', { showLockBanner: v })} label="Tampilkan banner Focus Lock" description="Banner peringatan di bagian atas Focus Mode."/>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <Toggle checked={restDay.weeklyEnabled} onChange={(v) => updateSection('restDay', { weeklyEnabled: v })} label="Rekomendasi Rest Day mingguan" description="Pengingat istirahat muncul di halaman Streak."/>
      </div>

      <p className="mt-3 rounded-xl bg-warning-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-warning">
        Focus Lock bersifat simulasi UI — aplikasi tidak memiliki izin untuk menutup aplikasi lain
        di perangkat kamu.
      </p>
    </Panel>);
}
export function PrivacySettings() {
    return (<Panel title="Privasi" description="Penyimpanan dan privasi data lokal." action={<EyeOff className="size-4 text-accent"/>}>
      <p className="rounded-xl bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-muted">
        Semua data aplikasi ini tersimpan di localStorage browser kamu. Tidak ada server, tidak ada
        data yang dikirim ke luar perangkat.
      </p>

      <Button variant="outline" className="mt-3" onClick={() => toast.info('Mode lokal', 'Data tetap berada di browser ini.')}>
        Pelajari penyimpanan data
      </Button>
    </Panel>);
}
