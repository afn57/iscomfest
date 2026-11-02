import { Crosshair, Gauge, History, Timer } from 'lucide-react'
import { Panel, StatCard } from '../common'
import { focusStats } from '../../services/selectors'
import { useFocusStore } from '../../store/useFocusStore'
import { minutesToLabel, relativeFromNow } from '../../utils/date'
import { useTaskStore } from '../../store/useTaskStore'

export function FocusSummary() {
  const stats = focusStats()
  const sessions = useFocusStore((s) => s.sessions).slice(0, 4)
  const tasks = useTaskStore((s) => s.tasks)

  return (
    <Panel title="Focus time statistics" description="Ringkasan performa sesi fokus kamu.">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total sesi"
          value={stats.sessions}
          icon={<Crosshair />}
          tone="primary"
          sub={`${stats.completed} selesai penuh`}
        />
        <StatCard
          label="Rata-rata"
          value={minutesToLabel(stats.avgMinutes)}
          icon={<Gauge />}
          tone="accent"
          sub="per sesi fokus"
        />
        <StatCard
          label="Total waktu"
          value={minutesToLabel(stats.totalMinutes)}
          icon={<Timer />}
          tone="success"
          sub="kumulatif"
        />
        <StatCard
          label="Completion rate"
          value={`${stats.completionRate}%`}
          icon={<History />}
          tone="warning"
          sub="sesi yang tuntas"
        />
      </div>

      <ul className="mt-4 space-y-2 border-t border-line pt-3">
        {sessions.map((s) => {
          const task = tasks.find((t) => t.id === s.taskId)
          return (
            <li key={s.id} className="flex items-center gap-2.5 text-[12.5px]">
              <span
                className={`size-1.5 shrink-0 rounded-full ${
                  s.status === 'completed' ? 'bg-success' : 'bg-warning'
                }`}
              />
              <span className="min-w-0 flex-1 truncate text-ink-soft">
                {task?.title ?? 'Sesi tanpa tugas'}
              </span>
              <span className="shrink-0 tabular-nums text-ink-muted">
                {minutesToLabel(s.actualMinutes)}
              </span>
              <span className="hidden shrink-0 text-ink-muted sm:block">
                {relativeFromNow(s.endedAt)}
              </span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
