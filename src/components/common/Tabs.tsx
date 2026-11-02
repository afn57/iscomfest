import { useState, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

export interface TabItem {
  id: string
  label: ReactNode
  icon?: ReactNode
  badge?: ReactNode
}

interface TabsProps {
  items: TabItem[]
  value?: string
  onChange?: (id: string) => void
  className?: string
  /** Tabs can scroll horizontally on small screens. */
  scroll?: boolean
}

export function Tabs({ items, value, onChange, className, scroll = true }: TabsProps) {
  const [internal, setInternal] = useState(items[0]?.id)
  const active = value ?? internal
  const select = (id: string) => {
    if (value === undefined) setInternal(id)
    onChange?.(id)
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-line bg-surface-2 p-1',
        scroll && 'max-w-full overflow-x-auto no-scrollbar',
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(item.id)}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-all duration-150',
              isActive
                ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(6,10,22,0.3)]'
                : 'text-ink-muted hover:text-ink-soft',
            )}
          >
            {item.icon && <span className="[&>svg]:size-3.5">{item.icon}</span>}
            {item.label}
            {item.badge !== undefined && (
              <span
                className={cn(
                  'ml-0.5 rounded-full px-1.5 py-px text-[10px] tabular-nums',
                  isActive ? 'bg-primary-soft text-primary' : 'bg-surface-3 text-ink-muted',
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
