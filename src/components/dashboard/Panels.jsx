import { useNavigate } from 'react-router-dom';
import { ArrowRight, Crosshair, ListChecks, Target, Zap, Coffee } from 'lucide-react';
import { Panel } from '../common';
import { goalSummary } from '../../services/selectors';
import { useProgressStore } from '../../store/useProgressStore';
import { cn } from '../../utils/cn';
import { formatShort } from '../../utils/date';
export function DailyGoalsWidget() {
    const { items, metCount, total } = goalSummary();
    const navigate = useNavigate();
    return (<Panel title="Daily goals" description={`${metCount} dari ${total} target tercapai hari ini.`} action={<button type="button" onClick={() => navigate('/streak')} className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
          Detail <ArrowRight className="size-3"/>
        </button>}>
      <ul className="space-y-3">
        {items.map(({ goal, value, percent, met }) => (<li key={goal.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[12.5px]">
              <span className={cn('font-medium', met ? 'text-success' : 'text-ink-soft')}>
                {goal.label}
              </span>
              <span className="tabular-nums text-ink-muted">
                {value} / {goal.target} {goal.unit === 'minutes' ? 'm' : ''}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <div className={cn('h-full rounded-full transition-all duration-500', met ? 'bg-success' : 'bg-primary')} style={{ width: `${percent}%` }}/>
            </div>
          </li>))}
      </ul>
    </Panel>);
}
const LOG_ICONS = {
    focus: { icon: Crosshair, tone: 'bg-primary-soft text-primary' },
    task: { icon: ListChecks, tone: 'bg-success-soft text-success' },
    goal: { icon: Target, tone: 'bg-accent-soft text-accent' },
    level: { icon: Zap, tone: 'bg-primary-soft text-primary' },
    rest: { icon: Coffee, tone: 'bg-accent-soft text-accent' },
    pomodoro: { icon: Target, tone: 'bg-success-soft text-success' },
};
export function ActivityFeed() {
    const log = useProgressStore((s) => s.progress.log).slice(0, 7);
    return (<Panel title="Aktivitas terbaru" description="Jejak produktivitas kamu." padding="none">
      <ul className="divide-y divide-line px-1.5 pb-2">
        {log.map((entry) => {
            const meta = LOG_ICONS[entry.type] ?? LOG_ICONS.focus;
            const Icon = meta.icon;
            return (<li key={entry.id} className="flex items-start gap-3 px-3.5 py-3">
              <span className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                <Icon className="size-3.5"/>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-ink-soft">{entry.message}</p>
                <p className="mt-1 text-[11.5px] text-ink-muted">{formatShort(entry.at)}</p>
              </div>
              {entry.xp !== undefined && (<span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
                  +{entry.xp} XP
                </span>)}
            </li>);
        })}
      </ul>
    </Panel>);
}
