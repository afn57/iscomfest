import { useState } from 'react';
import { Bell, Save, TimerReset } from 'lucide-react';
import { Button, Field, Input, Panel, Toggle } from '../common';
import { DEFAULT_POMODORO, usePomodoroStore } from '../../store/usePomodoroStore';
import { usePomodoroRuntimeStore } from '../../store/usePomodoroRuntimeStore';
import { toast } from '../../store/useToastStore';
import { ConfirmDialog } from '../common';
export function PomodoroSettingsPanel() {
    const settings = usePomodoroStore((s) => s.settings);
    const updateSettings = usePomodoroStore((s) => s.updateSettings);
    const resetStore = usePomodoroStore((s) => s.reset);
    const applyPhase = usePomodoroRuntimeStore((s) => s.applyPhase);
    const running = usePomodoroRuntimeStore((s) => s.running);
    const [draft, setDraft] = useState(settings);
    const [errors, setErrors] = useState({});
    const [confirmReset, setConfirmReset] = useState(false);
    const [saving, setSaving] = useState(false);
    const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
    const save = () => {
        const next = {};
        if (draft.focusMinutes < 5 || draft.focusMinutes > 180)
            next.focusMinutes = '5–180 menit.';
        if (draft.shortBreakMinutes < 1 || draft.shortBreakMinutes > 60)
            next.shortBreakMinutes = '1–60 menit.';
        if (draft.longBreakMinutes < 5 || draft.longBreakMinutes > 90)
            next.longBreakMinutes = '5–90 menit.';
        if (draft.sessionsBeforeLongBreak < 2 || draft.sessionsBeforeLongBreak > 8)
            next.sessionsBeforeLongBreak = '2–8 sesi.';
        setErrors(next);
        if (Object.keys(next).length > 0)
            return;
        setSaving(true);
        window.setTimeout(() => {
            updateSettings(draft);
            applyPhase(usePomodoroRuntimeStore.getState().phase, usePomodoroRuntimeStore.getState().cycleIndex);
            setSaving(false);
            toast.success('Pengaturan Pomodoro disimpan', 'Timer baru memakai durasi terbaru.');
        }, 280);
    };
    const resetAll = () => {
        resetStore();
        applyPhase('focus', 1);
        setDraft(DEFAULT_POMODORO);
        setConfirmReset(false);
        toast.info('Pengaturan Pomodoro dikembalikan', 'Nilai default 25 / 5 / 15 dipulihkan.');
    };
    return (<>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Durasi sesi" description="Sesuaikan ritme kerjamu.">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Focus (menit)" error={errors.focusMinutes}>
              <Input type="number" min={5} max={180} value={draft.focusMinutes} onChange={(e) => set('focusMinutes', Number(e.target.value))}/>
            </Field>
            <Field label="Short break (menit)" error={errors.shortBreakMinutes}>
              <Input type="number" min={1} max={60} value={draft.shortBreakMinutes} onChange={(e) => set('shortBreakMinutes', Number(e.target.value))}/>
            </Field>
            <Field label="Long break (menit)" error={errors.longBreakMinutes}>
              <Input type="number" min={5} max={90} value={draft.longBreakMinutes} onChange={(e) => set('longBreakMinutes', Number(e.target.value))}/>
            </Field>
            <Field label="Long break setelah" error={errors.sessionsBeforeLongBreak} hint="sesi fokus">
              <Input type="number" min={2} max={8} value={draft.sessionsBeforeLongBreak} onChange={(e) => set('sessionsBeforeLongBreak', Number(e.target.value))}/>
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="primary" icon={<Save />} onClick={save} loading={saving}>
              Simpan pengaturan
            </Button>
            <Button variant="ghost" icon={<TimerReset />} onClick={() => setConfirmReset(true)}>
              Kembalikan default
            </Button>
          </div>
          {running && (<p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-[12px] text-warning">
              Timer sedang berjalan — durasi baru akan dipakai pada siklus berikutnya.
            </p>)}
        </Panel>

        <Panel title="Preferensi" description="Perilaku timer dan umpan balik.">
          <Toggle checked={draft.autoStartBreaks} onChange={(v) => set('autoStartBreaks', v)} label="Mulai istirahat otomatis" description="Istirahat langsung berjalan setelah sesi fokus selesai."/>
          <div className="border-t border-line"/>
          <Toggle checked={draft.autoStartFocus} onChange={(v) => set('autoStartFocus', v)} label="Mulai fokus otomatis" description="Sesi fokus berikutnya langsung berjalan setelah istirahat."/>
          <div className="border-t border-line"/>
          <Toggle checked={draft.soundEnabled} onChange={(v) => set('soundEnabled', v)} label="Suara penanda" description="Nada pendek saat sesi selesai."/>
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3">
            <Bell className="mt-0.5 size-4 shrink-0 text-accent"/>
            <p className="text-[12px] leading-relaxed text-ink-muted">
              Notifikasi dalam aplikasi juga dikirim ke panel notifikasi di topbar.
            </p>
          </div>
        </Panel>
      </div>

      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} onConfirm={resetAll} title="Kembalikan pengaturan default?" tone="danger" confirmLabel="Kembalikan" body="Durasi 25 / 5 / 15 menit dan long break setelah 4 sesi akan dipulihkan. Riwayat sesi tetap tersimpan."/>
    </>);
}
