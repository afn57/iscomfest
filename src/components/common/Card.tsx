import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const PADDING = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ padding = 'md', hover, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card bg-surface border border-line shadow-card',
        PADDING[padding],
        hover && 'transition-colors duration-150 hover:border-line-strong',
        className,
      )}
      {...rest}
    />
  )
}

interface PanelProps {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

/** Card with a header row — used everywhere a section needs a title. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  padding = 'md',
}: PanelProps) {
  return (
    <section
      className={cn(
        'rounded-card bg-surface border border-line shadow-card flex flex-col',
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
          <div className="min-w-0">
            {title && (
              <h3 className="text-[15px] font-semibold text-ink leading-tight">{title}</h3>
            )}
            {description && (
              <p className="mt-1 text-[13px] text-ink-muted leading-snug">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={cn(PADDING[padding], !title && !action && 'pt-5', 'flex-1', bodyClassName)}>
        {children}
      </div>
    </section>
  )
}
