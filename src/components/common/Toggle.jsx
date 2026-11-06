import { cn } from '../../utils/cn';
export function Toggle({ checked, onChange, label, description, disabled, className, id }) {
    const control = (<button type="button" role="switch" aria-checked={checked} id={id} disabled={disabled} onClick={() => onChange(!checked)} className={cn('relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-200', 'disabled:opacity-50 disabled:cursor-not-allowed', checked ? 'bg-primary border-primary' : 'bg-surface-3 border-line-strong', className)}>
      <span className={cn('inline-block size-4.5 transform rounded-full bg-white shadow transition-transform duration-200', checked ? 'translate-x-5.5' : 'translate-x-1')}/>
    </button>);
    if (!label)
        return control;
    return (<div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{label}</div>
        {description && (<div className="mt-0.5 text-[13px] text-ink-muted leading-snug">{description}</div>)}
      </div>
      {control}
    </div>);
}
