import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <span className={cn('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-lg',
          'border border-line bg-surface-3 px-2.5 py-1.5 text-[11px] font-medium text-ink shadow-pop',
          'opacity-0 translate-y-0.5 transition-all duration-150 group-hover/tt:opacity-100 group-hover/tt:translate-y-0',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
        )}
      >
        {content}
      </span>
    </span>
  )
}
