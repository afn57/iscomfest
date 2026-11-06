import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Clock, History, Inbox, Timer } from 'lucide-react';
import { Badge, Button, EmptyState, Panel } from '../common';
import { PHASE_META, usePomodoroStore } from '../../store/usePomodoroStore';
import { useTaskStore } from '../../store/useTaskStore';
import { formatShort, formatTime, minutesToLabel, todayKey } from '../../utils/date';
import { cn } from '../../utils/cn';
const AXIS_TICK = { fill: 'var(--ink-muted)', fontSize: 11 };
export function PomodoroHistory() {
    const records = usePomodoroStore((s) => s.records);
    const clearHistory = usePomodoroStore((s) => s.clearHistory);
    const tasks = useTaskStore((s) => s.tasks);
    const focusRecords = records.filter((r) => r.phase === 'focus');
    const todayFocus = focusRecords.filter((r) => r.completedAt.slice(0, 10) === todayKey());
    const todayMinutes = todayFocus.reduce((sum, r) => sum + r.minutes, 0);
    const weekly = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (6 - i));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const minutes = focusRecords
            .filter((r) => r.completedAt.slice(0, 10) === key)
            .reduce((sum, r) => sum + r.minutes, 0);
        return { label: d.toLocaleDateString('id-ID', { weekday: 'short' }), minutes };
    });
    return (<div className="space-y-4 sm:space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={<Timer className="size-4"/>} label="Fokus hari ini" value={String(todayFocus.length)} sub={`${todayMinutes} menit`}/>
        <Metric icon={<Clock className="size-4"/>} label="Total sesi" value={String(focusRecords.length)} sub="kumulatif"/>
        <Metric icon={<History className="size-4"/>} label="Istirahat" value={String(records.filter((r) => r.phase !== 'focus').length)} sub="short + long break"/>
      </div>

      <Panel title="Pomodoro per hari" description="Menit fokus selama 7 hari terakhir.">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 4"/>
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false}/>
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={44}/>
              <Tooltip cursor={{ fill: 'var(--surface-2)' }} contentStyle={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            fontSize: 12,
            color: 'var(--ink)',
        }}/>
              <Bar dataKey="minutes" name="Menit" fill="var(--chart-2)" radius={[6, 6, 2, 2]} maxBarSize={30}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Riwayat sesi Pomodoro" description={`${records.length} entri tersimpan.`} action={records.length > 0 ? (<Button size="sm" variant="ghost" onClick={clearHistory}>
              Bersihkan riwayat
            </Button>) : null} padding="none">
        {records.length === 0 ? (<div className="px-5 pb-5">
            <EmptyState compact icon={<Inbox />} title="Riwayat kosong" description="Jalankan sesi Pomodoro untuk mengisi riwayat."/>
          </div>) : (<ul className="max-h-[26rem] divide-y divide-line overflow-y-auto px-1.5 pb-2">
            {records.slice(0, 40).map((r) => {
                const task = tasks.find((t) => t.id === r.taskId);
                const meta = PHASE_META[r.phase];
                return (<li key={r.id} className="flex items-center gap-3 px-3.5 py-2.5">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10.5px] font-semibold', r.phase === 'focus'
                        ? 'bg-primary-soft text-primary'
                        : r.phase === 'short_break'
                            ? 'bg-success-soft text-success'
                            : 'bg-accent-soft text-accent')}>
                    {meta.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-ink">
                      {r.phase === 'focus' ? (task?.title ?? 'Fokus tanpa tugas') : 'Istirahat'}
                    </p>
                    <p className="text-[11.5px] text-ink-muted">
                      {formatShort(r.completedAt)} · {formatTime(r.completedAt)}
                    </p>
                  </div>
                  <Badge tone="outline">{minutesToLabel(r.minutes)}</Badge>
                </li>);
            })}
          </ul>)}
      </Panel>
    </div>);
}
function Metric({ icon, label, value, sub, }) {
    return (<div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2 text-[12px] text-ink-muted">
        <span className="flex size-7 items-center justify-center rounded-lg bg-surface-3 text-ink-soft">
          {icon}
        </span>
        {label}
      </div>
      <div className="mt-2.5 text-2xl font-semibold tabular-nums text-ink font-display">{value}</div>
      <div className="mt-1 text-[12px] text-ink-muted">{sub}</div>
    </div>);
}
