import { cn } from '../../utils/cn';
const TONES = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
};
const SIZES = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' };
export function ProgressBar({ value, max = 100, tone = 'primary', size = 'md', showLabel, label, className, }) {
    const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, Math.round((value / max) * 100)));
    return (<div className={cn('w-full', className)}>
      {(showLabel || label) && (<div className="mb-1.5 flex items-center justify-between text-[12px]">
          <span className="text-ink-muted">{label}</span>
          <span className="font-medium text-ink-soft tabular-nums">{pct}%</span>
        </div>)}
      <div className={cn('w-full overflow-hidden rounded-full bg-surface-3', SIZES[size])}>
        <div className={cn('h-full rounded-full transition-all duration-500 ease-out', TONES[tone])} style={{ width: `${pct}%` }}/>
      </div>
    </div>);
}
