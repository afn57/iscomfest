import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Panel } from '../common';
import { usePomodoroStore } from '../../store/usePomodoroStore';
const AXIS_TICK = { fill: 'var(--ink-muted)', fontSize: 11 };
export function PomodoroHistory() {
    const records = usePomodoroStore((s) => s.records);
    const focusRecords = records.filter((r) => r.phase === 'focus');
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
    return (<Panel title="Pomodoro per hari" description="Menit fokus selama 7 hari terakhir.">
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
    </Panel>);
}
