import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

interface Crumb {
  label: string
  to?: string
}

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  crumbs?: Crumb[]
  className?: string
}

export function PageHeader({ title, description, actions, crumbs, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-muted">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-line-strong">/</span>}
                {c.to ? (
                  <Link to={c.to} className="transition-colors hover:text-primary">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink-soft">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold text-ink font-display sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted leading-relaxed">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}
