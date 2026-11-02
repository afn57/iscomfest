import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ListChecks, Crosshair, CalendarDays, MoreHorizontal } from 'lucide-react'
import { cn } from '../../utils/cn'

const ITEMS = [
  { to: '/dashboard', label: 'Home', Icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', Icon: ListChecks },
  { to: '/focus', label: 'Focus', Icon: Crosshair },
  { to: '/calendar', label: 'Calendar', Icon: CalendarDays },
  { to: '/community', label: 'More', Icon: MoreHorizontal },
]

export function MobileNav() {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex min-w-16 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10.5px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-ink-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-6 w-12 items-center justify-center rounded-full transition-colors',
                    isActive && 'bg-primary-soft',
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
