import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSettingsStore } from '../../store/useSettingsStore'
import { productivitySeries, statusDistribution, todayTasks, focusStats } from '../../services/selectors'
import { Panel, ProgressBar } from '../common'
import { taskCompletionStats } from '../../services/selectors'
import { useTaskStore } from '../../store/useTaskStore'

const AXIS_TICK = { fill: 'var(--ink-muted)', fontSize: 11 }
const GRID_STROKE = 'var(--line)'

interface ChartPayload {
  name?: string | number
  value?: number | number[]
  color?: string | number
  payload?: Record<string, unknown>
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: ChartPayload[]
  label?: string | number
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-pop">
      {label !== undefined && (
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          {label}
        </div>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px] text-ink">
          <span
            className="size-2 rounded-full"
            style={{ background: String(entry.color ?? 'var(--primary)') }}
          />
          <span className="text-ink-muted">{entry.name}</span>
          <span className="ml-auto font-medium tabular-nums">
            {Array.isArray(entry.value) ? entry.value.join(' / ') : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ProductivityChart() {
  const reduceMotion = useSettingsStore((s) => s.settings.reduceMotion)
  const data = productivitySeries(7)

  return (
    <Panel
      title="Daily productivity"
      description="Menit fokus dan tugas yang selesai dalam 7 hari terakhir."
      className="min-w-0"
    >
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} strokeDasharray="3 4" />
            <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={42} />
            <Tooltip cursor={{ fill: 'var(--surface-2)' }} content={<ChartTooltip />} />
            <Bar
              dataKey="focusMinutes"
              name="Fokus (menit)"
              fill="var(--chart-1)"
              radius={[6, 6, 2, 2]}
              maxBarSize={26}
              isAnimationActive={!reduceMotion}
            />
            <Bar
              dataKey="tasksDone"
              name="Tugas selesai"
              fill="var(--chart-3)"
              radius={[6, 6, 2, 2]}
              maxBarSize={26}
              isAnimationActive={!reduceMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center gap-4 border-t border-line pt-3 text-[12px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: 'var(--chart-1)' }} />
          Menit fokus
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: 'var(--chart-3)' }} />
          Tugas selesai
        </span>
      </div>
    </Panel>
  )
}

const DONUT_COLORS = ['var(--chart-5)', 'var(--chart-2)', 'var(--chart-3)']

export function StatusDonut() {
  const reduceMotion = useSettingsStore((s) => s.settings.reduceMotion)
  const tasks = useTaskStore((s) => s.tasks)
  const stats = taskCompletionStats(tasks)
  const data = statusDistribution().filter((d) => d.value > 0)

  return (
    <Panel
      title="Task status"
      description={`${stats.completed} dari ${stats.total} tugas selesai.`}
    >
      <div className="relative h-44 w-full">
        {stats.total === 0 ? (
          <div className="flex h-full items-center justify-center text-[13px] text-ink-muted">
            Belum ada tugas.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="66%"
                outerRadius="92%"
                paddingAngle={3}
                stroke="none"
                isAnimationActive={!reduceMotion}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.key} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-ink font-display tabular-nums">
            {stats.percent}%
          </span>
          <span className="text-[11px] text-ink-muted">selesai</span>
        </div>
      </div>

      <ul className="mt-3 space-y-2 border-t border-line pt-3">
        {data.map((entry, i) => (
          <li key={entry.key} className="flex items-center gap-2 text-[12.5px]">
            <span
              className="size-2.5 rounded-full"
              style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="text-ink-muted">{entry.name}</span>
            <span className="ml-auto font-medium tabular-nums text-ink-soft">{entry.value}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

export function TodayProgress() {
  const tasks = useTaskStore((s) => s.tasks)
  const today = todayTasks()
  const stats = focusStats()
  const doneToday = today.filter((t) => t.status === 'completed').length
  const percent = today.length === 0 ? 0 : Math.round((doneToday / today.length) * 100)

  return (
    <Panel title="Progress hari ini" description={`${today.length} tugas dijadwalkan hari ini.`}>
      <ProgressBar
        value={percent}
        label="Target harian"
        tone={percent === 100 ? 'success' : 'primary'}
        size="md"
      />
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Selesai" value={doneToday} tone="text-success" />
        <MiniStat label="Berjalan" value={today.filter((t) => t.status === 'in_progress').length} tone="text-accent" />
        <MiniStat label="Menunggu" value={today.filter((t) => t.status === 'todo').length} tone="text-ink-soft" />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[12.5px]">
        <span className="text-ink-muted">Total tugas terdaftar</span>
        <span className="font-medium tabular-nums text-ink-soft">{tasks.length}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[12.5px]">
        <span className="text-ink-muted">Fokus kumulatif</span>
        <span className="font-medium tabular-nums text-ink-soft">{stats.totalMinutes} menit</span>
      </div>
    </Panel>
  )
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5 text-center">
      <div className={`text-lg font-semibold tabular-nums font-display ${tone}`}>{value}</div>
      <div className="mt-0.5 text-[11px] text-ink-muted">{label}</div>
    </div>
  )
}
