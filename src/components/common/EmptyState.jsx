import { cn } from '../../utils/cn';
export function EmptyState({ icon, title, description, action, compact, className }) {
    return (<div className={cn('flex flex-col items-center justify-center text-center rounded-card border border-dashed border-line', compact ? 'px-4 py-8' : 'px-6 py-10', className)}>
      {icon && (<div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-surface-2 text-ink-muted [&>svg]:size-5">
          {icon}
        </div>)}
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {description && (<p className="mt-1.5 max-w-sm text-[13px] text-ink-muted leading-relaxed">{description}</p>)}
      {action && <div className="mt-4">{action}</div>}
    </div>);
}
