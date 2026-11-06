import { useState } from 'react';
import { CalendarOff, CalendarPlus, MoonStar, Trash2 } from 'lucide-react';
import { scheduleRestDay, cancelRestDay } from '../../services/actions';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { cn } from '../../utils/cn';
import { dayKey, formatShort, todayKey } from '../../utils/date';
import { Button, Field, Input, Panel, Select, Toggle } from '../common';
const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export function RestDayManager() {
    const restDays = useCalendarStore((s) => s.restDays);
    const streak = useProgressStore((s) => s.progress.currentStreak);
    const restSettings = useSettingsStore((s) => s.settings.restDay);
    const updateSection = useSettingsStore((s) => s.updateSection);
    const [date, setDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return dayKey(d);
    });
    const [reason, setReason] = useState('');
    const today = todayKey();
    const sorted = [...restDays].sort((a, b) => a.date.localeCompare(b.date));
    const upcoming = sorted.filter((r) => r.date >= today);
    const past = sorted.filter((r) => r.date < today);
    const due = restSettings.weeklyEnabled && streak >= restSettings.recommendAfterDays;
    const add = () => {
        if (!date)
            return;
        scheduleRestDay(date, reason.trim() || undefined);
        setReason('');
    };
    const scheduleTomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        scheduleRestDay(dayKey(d), 'Recovery setelah streak panjang.');
    };
    return (<div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <Panel title="Rest Day" description="Istirahat terjadwal yang menjaga streak tetap hidup." action={<span className="text-[12.5px] text-ink-muted">
            {upcoming.length} terjadwal · {past.length} lampau
          </span>}>
        {due && (<div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-accent/40 bg-accent-soft px-4 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
              <MoonStar className="size-4.5"/>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-ink">
                Rekomendasi: jadwalkan istirahat
              </p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink-muted">
                Streak {streak} hari sudah melewati batas nyaman{' '}
                {restSettings.recommendAfterDays} hari.
              </p>
            </div>
            <Button size="sm" variant="accent" onClick={scheduleTomorrow}>
              Istirahat besok
            </Button>
          </div>)}

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <Field label="Tanggal">
            <Input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)}/>
          </Field>
          <Field label={<>
                Alasan <span className="font-normal text-ink-muted">opsional</span>
              </>}>
            <Input value={reason} placeholder="Mis. Recovery setelah ujian" onChange={(e) => setReason(e.target.value)}/>
          </Field>
          <Button variant="primary" icon={<CalendarPlus />} onClick={add}>
            Jadwalkan
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {sorted.length === 0 && (<div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line py-8 text-center">
              <CalendarOff className="size-5 text-ink-muted"/>
              <p className="text-[13px] text-ink-soft">Belum ada Rest Day dijadwalkan.</p>
              <p className="text-[12.5px] text-ink-muted">
                Pilih tanggal di atas untuk menjaga ritme jangka panjang.
              </p>
            </div>)}

          {sorted.map((r) => {
            const isPast = r.date < today;
            return (<div key={r.id} className={cn('group flex items-center gap-3 rounded-xl border px-3.5 py-2.5', isPast ? 'border-line bg-surface-2/60' : 'border-accent/30 bg-accent-soft')}>
                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', isPast ? 'bg-surface-3 text-ink-muted' : 'bg-accent/20 text-accent')}>
                  <MoonStar className="size-4"/>
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-[13.5px] font-medium', isPast ? 'text-ink-muted' : 'text-ink')}>
                    {formatShort(r.date)}
                  </p>
                  <p className="truncate text-[12.5px] text-ink-muted">
                    {r.reason ?? 'Tanpa alasan — istirahat murni.'}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11.5px] font-medium text-ink-muted">
                  {isPast ? 'lampau' : 'netral'}
                </span>
                <button type="button" aria-label="Hapus Rest Day" onClick={() => cancelRestDay(r.date)} className="shrink-0 rounded-lg p-1.5 text-ink-muted opacity-0 transition-all hover:bg-surface hover:text-danger focus:opacity-100 group-hover:opacity-100">
                  <Trash2 className="size-3.5"/>
                </button>
              </div>);
        })}
        </div>
      </Panel>

      <Panel title="Aturan Rest Day" description="Sesuaikan kebijakan perlindungan streak.">
        <Toggle checked={restSettings.weeklyEnabled} onChange={(v) => updateSection('restDay', { weeklyEnabled: v })} label="Istirahat mingguan" description="Dapatkan rekomendasi istirahat secara berkala."/>
        <div className="border-t border-line"/>

        <div className="py-4">
          <Field label="Hari istirahat mingguan" hint="dipakai sebagai penanda rutinitas">
            <Select value={String(restSettings.weeklyDay)} onChange={(e) => updateSection('restDay', { weeklyDay: Number(e.target.value) })}>
              {WEEKDAYS.map((w, i) => (<option key={w} value={i}>
                  {w}
                </option>))}
            </Select>
          </Field>
        </div>
        <div className="border-t border-line"/>

        <div className="py-4">
          <Field label="Rekomendasi setelah" hint="hari streak beruntun" error={restSettings.recommendAfterDays < 2 || restSettings.recommendAfterDays > 14
            ? 'Antara 2 dan 14 hari.'
            : undefined}>
            <Input type="number" min={2} max={14} value={restSettings.recommendAfterDays} onChange={(e) => updateSection('restDay', {
            recommendAfterDays: Math.min(14, Math.max(2, Number(e.target.value) || 2)),
        })}/>
          </Field>
        </div>
        <div className="border-t border-line"/>

        <Toggle checked={restSettings.protectStreak} onChange={(v) => updateSection('restDay', { protectStreak: v })} label="Proteksi streak" description="Rest Day dijadwalkan menjadi jembatan antar hari aktif."/>

        <p className="mt-4 rounded-xl bg-surface-2 px-3.5 py-3 text-[12.5px] leading-relaxed text-ink-muted">
          Rest Day tidak memberi XP, tidak menaikkan streak, dan tidak dihitung sebagai hari aktif —
          ia hanya mencegah streak ter-reset.
        </p>
      </Panel>
    </div>);
}
