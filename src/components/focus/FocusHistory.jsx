import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts';
import { Crosshair, History, Inbox } from 'lucide-react';
import { Badge, EmptyState, Panel, Select } from '../common';
import { useFocusStore } from '../../store/useFocusStore';
import { useTaskStore } from '../../store/useTaskStore';
import { minutesToLabel, relativeFromNow } from '../../utils/date';
import { cn } from '../../utils/cn';
const AXIS_TICK = { fill: 'var(--ink-muted)', fontSize: 11 };
export function FocusHistory() {
    const sessions = useFocusStore((s) => s.sessions);
    const tasks = useTaskStore((s) => s.tasks);
    const [limit, setLimit] = useState(8);
    const weekly = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - (6 - i));
            return d;
        });
        return days.map((d) => {
            const next = new Date(d);
            next.setDate(next.getDate() + 1);
            const minutes = sessions
                .filter((s) => {
                const end = new Date(s.endedAt);
                return end >= d && end < next;
            })
                .reduce((sum, s) => sum + s.actualMinutes, 0);
            return {
                label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
                minutes,
            };
        });
    }, [sessions]);
    return (<div className="space-y-4 sm:space-y-5">
      <Panel title="Focus time minggu ini" description="Total menit fokus per hari.">
        <div className="h-48 w-full">
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
              <Bar dataKey="minutes" name="Menit" fill="var(--chart-1)" radius={[6, 6, 2, 2]} maxBarSize={30}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Focus Session History" description={`${sessions.length} sesi tercatat di perangkat ini.`} action={<Select aria-label="Jumlah riwayat" value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))} className="h-8 w-auto text-[12.5px]">
            <option value="8">8 sesi</option>
            <option value="20">20 sesi</option>
            <option value="50">50 sesi</option>
          </Select>} padding="none">
        {sessions.length === 0 ? (<div className="px-5 pb-5">
            <EmptyState compact icon={<Inbox />} title="Belum ada sesi fokus" description="Mulai satu sesi dari tab Session. Riwayat akan tampil di sini."/>
          </div>) : (<ul className="divide-y divide-line px-1.5 pb-2">
            {sessions.slice(0, limit).map((s) => {
                const task = tasks.find((t) => t.id === s.taskId);
                return (<li key={s.id} className="flex items-start gap-3 px-3.5 py-3">
                  <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', s.status === 'completed'
                        ? s.dnd
                            ? 'bg-success-soft text-success'
                            : 'bg-primary-soft text-primary'
                        : 'bg-warning-soft text-warning')}>
                    <Crosshair className="size-4"/>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {task?.title ?? 'Sesi tanpa tugas'}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-ink-muted">
                      <span>{minutesToLabel(s.actualMinutes)}</span>
                      <span>·</span>
                      <span>{relativeFromNow(s.endedAt)}</span>
                      {s.dnd && (<>
                          <span>·</span>
                          <span className="text-accent">DND aktif</span>
                        </>)}
                      {s.restrictedAppIds.length > 0 && (<>
                          <span>·</span>
                          <span>{s.restrictedAppIds.length} app dibatasi</span>
                        </>)}
                    </div>
                  </div>
                  <Badge tone={s.status === 'completed' ? 'success' : 'warning'}>
                    {s.status === 'completed' ? 'Selesai' : 'Berhenti awal'}
                  </Badge>
                </li>);
            })}
          </ul>)}
      </Panel>

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
        <History className="mt-0.5 size-3.5 shrink-0"/>
        Catatan: hanya sesi yang diselesaikan penuh dengan DND aktif yang menambah streak.
        Sesi yang diakhiri lebih awal tetap memberi XP kecil.
      </p>
    </div>);
}
