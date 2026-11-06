import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Check, Flag, Inbox } from 'lucide-react';
import { Badge, Button, EmptyState, Panel } from '../common';
import { todayTasks } from '../../services/selectors';
import { useTaskStore } from '../../store/useTaskStore';
import { effectivePriority, PRIORITY_META } from '../../utils/priority';
import { deadlineLabel } from '../../utils/date';
import { cn } from '../../utils/cn';
import { CompletionDialog } from '../tasks/CompletionDialog';
export function TodayTaskList() {
    const tasks = todayTasks();
    const navigate = useNavigate();
    const [pending, setPending] = useState(null);
    return (<Panel title="Tugas hari ini" description="Tandai selesai untuk mendapatkan XP dan menjaga streak." className="min-w-0" action={<Button variant="ghost" size="sm" iconRight={<ArrowUpRight className="size-3.5"/>} onClick={() => navigate('/tasks')}>
          Semua tugas
        </Button>} padding="none">
      {tasks.length === 0 ? (<div className="px-5 pb-5">
          <EmptyState compact icon={<Inbox />} title="Tidak ada tugas hari ini" description="Buat tugas baru atau jadwalkan deadline di halaman My Tasks." action={<Button size="sm" onClick={() => navigate('/tasks?new=1')}>
                Buat tugas
              </Button>}/>
        </div>) : (<ul className="divide-y divide-line px-1.5 pb-2">
          {tasks.map((task) => {
                const meta = PRIORITY_META[effectivePriority(task)];
                const done = task.status === 'completed';
                return (<li key={task.id} className="group flex items-start gap-3 px-3.5 py-3">
                <button type="button" aria-label={done ? 'Buka kembali tugas' : 'Tandai selesai'} onClick={() => (done ? navigate('/tasks') : setPending(task))} className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-all', done
                        ? 'border-success bg-success text-white'
                        : 'border-line-strong bg-surface-2 hover:border-primary hover:bg-primary-soft')}>
                  {done && <Check className="size-3.5" strokeWidth={3}/>}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={cn('text-[13.5px] font-medium leading-snug', done ? 'text-ink-muted line-through' : 'text-ink')}>
                    {task.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-muted">
                    <Badge className={cn('!py-px !text-[10px]', meta.className)}>{meta.label}</Badge>
                    <span className="inline-flex items-center gap-1">
                      <Flag className="size-3"/>
                      {deadlineLabel(task.deadline, task.status)}
                    </span>
                    <span>·</span>
                    <span>{task.category}</span>
                  </div>
                </div>

                <button type="button" onClick={() => navigate('/tasks')} className="mt-0.5 shrink-0 rounded-lg p-1.5 text-ink-muted opacity-0 transition-opacity hover:bg-surface-2 hover:text-ink group-hover:opacity-100" aria-label="Detail tugas">
                  <ArrowUpRight className="size-4"/>
                </button>
              </li>);
            })}
        </ul>)}

      <CompletionDialog task={pending} open={pending !== null} onClose={() => setPending(null)}/>
    </Panel>);
}
export function UpcomingDeadlines() {
    const tasks = useTaskStore((s) => s.tasks);
    const navigate = useNavigate();
    const upcoming = tasks
        .filter((t) => t.status !== 'completed')
        .sort((a, b) => a.deadline.localeCompare(b.deadline))
        .slice(0, 5);
    return (<Panel title="Upcoming deadlines" description="Urgensi dihitung dari jarak waktu ke deadline." padding="none">
      {upcoming.length === 0 ? (<div className="px-5 pb-5">
          <EmptyState compact icon={<Inbox />} title="Tidak ada deadline aktif" description="Semua tugas sudah selesai."/>
        </div>) : (<ul className="divide-y divide-line px-1.5 pb-2">
          {upcoming.map((task) => {
                const overdue = new Date(task.deadline).getTime() < Date.now();
                const soon = !overdue && new Date(task.deadline).getTime() - Date.now() < 3 * 86_400_000;
                return (<li key={task.id}>
                <button type="button" onClick={() => navigate('/tasks')} className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-surface-2">
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', overdue ? 'bg-danger-soft text-danger' : soon ? 'bg-warning-soft text-warning' : 'bg-surface-3 text-ink-muted')}>
                    <Flag className="size-4"/>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">
                      {task.title}
                    </span>
                    <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                      {deadlineLabel(task.deadline, task.status)} · {task.category}
                    </span>
                  </span>
                  <Badge tone={overdue ? 'danger' : soon ? 'warning' : 'neutral'}>
                    {overdue ? 'Lewat' : soon ? 'Segera' : 'Rencana'}
                  </Badge>
                </button>
              </li>);
            })}
        </ul>)}
    </Panel>);
}
