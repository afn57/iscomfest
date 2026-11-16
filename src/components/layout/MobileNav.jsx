import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Crosshair, CalendarDays, Flame } from 'lucide-react';
import { cn } from '../../utils/cn';
const ITEMS = [
    { to: '/dashboard', label: 'Home', Icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', Icon: ListChecks },
    { to: '/focus', label: 'Focus', Icon: Crosshair },
    { to: '/calendar', label: 'Calendar', Icon: CalendarDays },
    { to: '/profile?view=streak', label: 'Streak', Icon: Flame, view: 'streak' },
];
export function MobileNav() {
    const { pathname, search } = useLocation();
    const view = new URLSearchParams(search).get('view');
    return (<nav aria-label="Navigasi utama" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex w-full max-w-md items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ to, label, Icon, view: itemView }) => {
            const active = itemView
                ? pathname === '/profile' && view === itemView
                : pathname === to || pathname.startsWith(`${to}/`);
            return (<Link key={to} to={to} aria-current={active ? 'page' : undefined} className={cn('flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium transition-colors', active ? 'text-primary' : 'text-ink-muted')}>
                <span className={cn('flex h-6 w-12 items-center justify-center rounded-full transition-colors', active && 'bg-primary-soft')}>
                  <Icon className="size-[18px]"/>
                </span>
                {label}
              </Link>);
        })}
      </div>
    </nav>);
}
