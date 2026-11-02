import { NavLink, useNavigate } from 'react-router-dom'
import { PanelLeftClose, PanelLeftOpen, Zap } from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useProfileStore } from '../../store/useProfileStore'
import { useProgressStore } from '../../store/useProgressStore'
import { IconByName, Avatar, Tooltip } from '../common'
import { cn } from '../../utils/cn'
import { levelFromXp } from '../../data/mock/gamification'
import { FOOTER_NAV, MAIN_NAV } from './navItems'

interface SidebarProps {
  className?: string
  onNavigate?: () => void
  variant?: 'desktop' | 'drawer'
}

export function Sidebar({ className, onNavigate, variant = 'desktop' }: SidebarProps) {
  const collapsed = useSettingsStore((s) => s.settings.compactSidebar)
  const update = useSettingsStore((s) => s.update)
  const profile = useProfileStore((s) => s.profile)
  const xp = useProgressStore((s) => s.progress.xp)
  const navigate = useNavigate()
  const level = levelFromXp(xp).level

  const isDrawer = variant === 'drawer'
  const isCompact = collapsed && !isDrawer

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-line bg-surface transition-[width] duration-200 ease-out',
        isCompact ? 'w-[76px]' : 'w-[248px]',
        className,
      )}
    >
      {/* Brand */}
      <div className={cn('flex items-center gap-2.5 px-4 pt-5 pb-4', isCompact && 'justify-center px-2')}>
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_20px_-10px_var(--primary)]">
          <Zap className="size-4.5" strokeWidth={2.5} />
        </div>
        {!isCompact && (
          <div className="min-w-0">
            <div className="font-display text-[15px] font-bold tracking-tight text-ink">FOCUSLY</div>
            <div className="truncate text-[10.5px] font-medium tracking-wide text-ink-muted">
              Build Your Focus.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-2">
        {MAIN_NAV.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            compact={isCompact}
            onClick={onNavigate}
          />
        ))}

        <div className={cn('my-2 border-t border-line', isCompact && 'mx-1')} />

        {FOOTER_NAV.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            label={item.label}
            icon={item.icon}
            compact={isCompact}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* User card + collapse */}
      <div className="border-t border-line p-2.5">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className={cn(
            'flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-surface-2',
            isCompact && 'justify-center',
          )}
          onClickCapture={onNavigate}
        >
          <Avatar avatarId={profile.avatarId} name={profile.displayName} size="sm" />
          {!isCompact && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-ink">{profile.displayName}</div>
              <div className="truncate text-[11px] text-ink-muted">Level {level} · {profile.username}</div>
            </div>
          )}
        </button>

        {!isDrawer && (
          <button
            type="button"
            onClick={() => update({ compactSidebar: !collapsed })}
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className={cn(
              'mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink',
              isCompact && 'justify-center',
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!isCompact && <span>Ciutkan sidebar</span>}
          </button>
        )}
      </div>
    </aside>
  )
}

interface SidebarLinkProps {
  to: string
  label: string
  icon: string
  compact: boolean
  onClick?: () => void
}

function SidebarLink({ to, label, icon, compact, onClick }: SidebarLinkProps) {
  const link = (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150',
          compact && 'justify-center px-0',
          isActive
            ? 'bg-primary-soft text-primary'
            : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
          )}
          <IconByName name={icon} className="size-[18px] shrink-0" />
          {!compact && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  )

  return compact ? <Tooltip content={label} side="bottom" className="w-full">{link}</Tooltip> : link
}
