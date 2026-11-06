import { Pause, Play, RotateCcw, SkipForward, Timer } from 'lucide-react';
import { Badge, Button, Panel, Select } from '../common';
import { RingProgress } from '../common/RingProgress';
import { usePomodoroRuntimeStore } from '../../store/usePomodoroRuntimeStore';
import { PHASE_META, phaseDuration, usePomodoroStore } from '../../store/usePomodoroStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useNow } from '../../hooks/useNow';
import { msToClock, todayKey } from '../../utils/date';
import { cn } from '../../utils/cn';
const PHASE_RING = {
    focus: 'var(--primary)',
    short_break: 'var(--success)',
    long_break: 'var(--accent)',
};
export function PomodoroTimer() {
    const runtime = usePomodoroRuntimeStore();
    const settings = usePomodoroStore((s) => s.settings);
    const records = usePomodoroStore((s) => s.records);
    const tasks = useTaskStore((s) => s.tasks);
    useNow(runtime.running ? 250 : 500);
    const total = phaseDuration(runtime.phase, settings) * 60_000;
    const remaining = Math.max(0, runtime.running && runtime.endsAt ? runtime.endsAt - Date.now() : runtime.remainingMs);
    const percent = total === 0 ? 0 : ((total - remaining) / total) * 100;
    const completedToday = records.filter((r) => r.phase === 'focus' && r.completedAt.slice(0, 10) === todayKey()).length;
    const focusCompleted = records.filter((r) => r.phase === 'focus').length;
    const openTasks = tasks.filter((t) => t.status !== 'completed');
    const cycleDots = Array.from({ length: settings.sessionsBeforeLongBreak }, (_, i) => {
        const doneCount = runtime.phase === 'focus' ? runtime.cycleIndex - 1 : runtime.cycleIndex;
        return i < doneCount;
    });
    return (<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Panel padding="lg">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <Badge tone={runtime.phase === 'focus' ? 'primary' : 'success'}>
              {PHASE_META[runtime.phase].label}
            </Badge>
            <Badge tone="outline">Siklus {runtime.cycleIndex}/{settings.sessionsBeforeLongBreak}</Badge>
            <Badge tone="accent">{completedToday} fokus hari ini</Badge>
          </div>

          <RingProgress percent={percent} size={250} stroke={13} color={PHASE_RING[runtime.phase]} trackClassName="var(--surface-3)">
            <span className="font-display text-5xl font-bold tabular-nums text-ink">
              {msToClock(remaining)}
            </span>
            <span className="mt-1.5 text-[12px] text-ink-muted">
              {runtime.running ? 'berjalan' : runtime.remainingMs < total ? 'dijeda' : 'siap'}
            </span>
          </RingProgress>

          <div className="mt-4 flex items-center gap-1.5" aria-label="Progres siklus">
            {cycleDots.map((done, i) => (<span key={i} className={cn('h-1.5 rounded-full transition-all', done ? 'w-6 bg-primary' : 'w-3 bg-surface-3')}/>))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {!runtime.running ? (<Button size="lg" icon={<Play />} onClick={() => (runtime.remainingMs > 0 ? runtime.resume() : runtime.start())}>
                {runtime.remainingMs < total && runtime.remainingMs > 0 ? 'Resume' : 'Start'}
              </Button>) : (<Button size="lg" variant="secondary" icon={<Pause />} onClick={runtime.pause}>
                Pause
              </Button>)}
            <Button size="lg" variant="outline" icon={<RotateCcw />} onClick={runtime.reset}>
              Reset
            </Button>
            <Button size="lg" variant="ghost" icon={<SkipForward />} onClick={runtime.skip}>
              Skip
            </Button>
          </div>

          <p className="mt-4 max-w-md text-center text-[12.5px] leading-relaxed text-ink-muted">
            {runtime.phase === 'focus'
            ? `Fokus ${settings.focusMinutes} menit · istirahat ${settings.shortBreakMinutes} menit pendek dan ${settings.longBreakMinutes} menit panjang setelah ${settings.sessionsBeforeLongBreak} sesi.`
            : 'Istirahat aktif. Timer lanjut otomatis ke sesi fokus berikutnya sesuai preferensi kamu.'}
          </p>
        </div>
      </Panel>

      <div className="space-y-4 sm:space-y-5">
        <Panel title="Target sesi" description="Tugas yang sedang kamu kerjakan saat ini.">
          <Select value={runtime.taskId ?? ''} onChange={(e) => runtime.setTask(e.target.value || undefined)}>
            <option value="">Tanpa tugas spesifik</option>
            {openTasks.map((t) => (<option key={t.id} value={t.id}>
                {t.title}
              </option>))}
          </Select>

          <div className="mt-4 space-y-2 rounded-xl bg-surface-2 px-3.5 py-3 text-[12.5px]">
            <Row label="Total sesi tercatat" value={String(focusCompleted)}/>
            <Row label="Fokus hari ini" value={`${completedToday} sesi`}/>
            <Row label="Durasi saat ini" value={`${phaseDuration(runtime.phase, settings)} menit`}/>
            <Row label="Auto-start istirahat" value={settings.autoStartBreaks ? 'Aktif' : 'Nonaktif'}/>
          </div>
        </Panel>

        <div className="flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3">
          <Timer className="mt-0.5 size-4 shrink-0 text-primary"/>
          <p className="text-[12px] leading-relaxed text-ink-muted">
            Timer berjalan menggunakan timestamp internal, jadi tetap akurat walau tab dipindah.
            Riwayat sesi tersimpan di localStorage.
          </p>
        </div>
      </div>
    </div>);
}
function Row({ label, value }) {
    return (<div className="flex items-center justify-between gap-2">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink-soft tabular-nums">{value}</span>
    </div>);
}
