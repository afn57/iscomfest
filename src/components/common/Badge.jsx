import { cn } from '../../utils/cn';
const TONES = {
    neutral: 'bg-surface-3 text-ink-soft border-line-strong',
    primary: 'bg-primary-soft text-primary border-primary/30',
    accent: 'bg-accent-soft text-accent border-accent/30',
    success: 'bg-success-soft text-success border-success/30',
    warning: 'bg-warning-soft text-warning border-warning/30',
    danger: 'bg-danger-soft text-danger border-danger/30',
    outline: 'bg-transparent text-ink-muted border-line-strong',
};
export function Badge({ tone = 'neutral', children, className, icon, dot, title }) {
    return (<span title={title} className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide', TONES[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current"/>}
      {icon && <span className="[&>svg]:size-3">{icon}</span>}
      {children}
    </span>);
}
