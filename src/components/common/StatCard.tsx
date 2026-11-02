import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface StatCardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  tone?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
  trend?: ReactNode
  className?: string
}

const TONES = {
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-accent',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-surface-3 text-ink-soft',
}

export function StatCard({ label, value, sub, icon, tone = 'neutral', trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-line bg-surface p-4 shadow-card transition-colors duration-150 hover:border-line-strong',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[12px] font-medium uppercase tracking-wider text-ink-muted">
          {label}
        </span>
        {icon && (
          <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', TONES[tone])}>
            <span className="[&>svg]:size-4">{icon}</span>
          </span>
        )}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums text-ink font-display">{value}</span>
        {trend && <span className="text-[12px] font-medium text-success">{trend}</span>}
      </div>
      {sub && <div className="mt-1 text-[12px] text-ink-muted leading-snug">{sub}</div>}
    </div>
  )
}
