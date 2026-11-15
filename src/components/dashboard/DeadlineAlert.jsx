import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Badge } from '../common';
import { useTaskStore } from '../../store/useTaskStore';
import { atRiskOf } from '../../services/selectors';
import { effectivePriority, PRIORITY_META } from '../../utils/priority';
import { deadlineLabel } from '../../utils/date';
import { cn } from '../../utils/cn';
const LEVEL_STYLE = {
    urgent: { border: 'border-danger/40', bg: 'bg-danger-soft', fill: 'var(--danger-soft)', stroke: 'var(--danger)' },
    high: { border: 'border-warning/40', bg: 'bg-warning-soft', fill: 'var(--warning-soft)', stroke: 'var(--warning)' },
    medium: { border: 'border-accent/40', bg: 'bg-accent-soft', fill: 'var(--accent-soft)', stroke: 'var(--accent)' },
    low: { border: 'border-primary/40', bg: 'bg-primary-soft', fill: 'var(--primary-soft)', stroke: 'var(--primary)' },
};
const VISIBLE = 1;
export function DeadlineAlert() {
    const tasks = useTaskStore((s) => s.tasks);
    const navigate = useNavigate();
    const atRisk = useMemo(() => atRiskOf(tasks), [tasks]);
    if (atRisk.length === 0)
        return null;
    const worst = effectivePriority(atRisk[0]);
    const style = LEVEL_STYLE[worst] ?? LEVEL_STYLE.low;
    const counts = {};
    for (const t of atRisk) {
        const level = effectivePriority(t);
        counts[level] = (counts[level] || 0) + 1;
    }
    const shown = atRisk.slice(0, VISIBLE);
    const rest = atRisk.length - VISIBLE;
    return (<section className={cn('relative rounded-card border shadow-card', style.border, style.bg)} aria-label="Peringatan deadline">
      <svg aria-hidden viewBox="0 0 20 14" width="20" height="14" className="pointer-events-none absolute -top-3 right-[150px] sm:right-[172px]">
        <path d="M10 0 L20 14 L0 14 Z" fill="var(--page)"/>
        <path d="M10 0 L20 14 L0 14 Z" fill={style.fill}/>
        <path d="M1.43 12 L10 0 L18.57 12" fill="none" stroke={style.stroke} strokeOpacity="0.4" strokeWidth="1"/>
      </svg>

      <header className="flex items-center gap-3 border-b border-line/60 px-4 py-3 sm:px-5">
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', PRIORITY_META[worst].className)}>
          <Bell className="size-4"/>
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold leading-snug text-ink">
            {atRisk.length} tugas mendekati deadline
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {Object.entries(counts).map(([level, n]) => (<Badge key={level} className={cn('!py-px !text-[10px]', PRIORITY_META[level].className)}>
                {n} {PRIORITY_META[level].label}
              </Badge>))}
          </div>
        </div>
      </header>

      <ul className="divide-y divide-line/60 px-1.5 py-1">
        {shown.map((task) => {
              const meta = PRIORITY_META[effectivePriority(task)];
              return (<li key={task.id}>
              <button type="button" onClick={() => navigate(`/tasks?task=${task.id}`)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface/70">
                <span className={cn('h-8 w-1 shrink-0 rounded-full', meta.dot)}/>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {task.title}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                    {deadlineLabel(task.deadline, task.status)} · {task.category}
                  </span>
                </span>
                <Badge className={cn('!py-px !text-[10px]', meta.className)}>{meta.label}</Badge>
              </button>
            </li>);
            })}
      </ul>

      {rest > 0 && (<div className="border-t border-line/60 px-4 py-2.5 sm:px-5">
          <button type="button" onClick={() => navigate('/tasks')} className="text-[12.5px] font-semibold text-primary transition-colors hover:text-primary-strong">
            Baca selengkapnya ({rest} lainnya)
          </button>
        </div>)}
    </section>);
}
