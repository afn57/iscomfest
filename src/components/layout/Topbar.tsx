import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from 'lucide-react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useProfileStore } from '../../store/useProfileStore'
import { useNotificationStore } from '../../store/useNotificationStore'
import { Avatar, Button, Tooltip } from '../common'
import { PAGE_TITLES } from './navItems'
import { NotificationPanel } from './NotificationPanel'
import { SearchDialog } from './SearchDialog'

interface TopbarProps {
  onOpenMobileNav: () => void
}

export function Topbar({ onOpenMobileNav }: TopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useSettingsStore((s) => s.settings.theme)
  const toggleTheme = useSettingsStore((s) => s.toggleTheme)
  const profile = useProfileStore((s) => s.profile)
  const notifications = useNotificationStore((s) => s.notifications)
  const unread = notifications.filter((n) => !n.read).length

  const [notifOpen, setNotifOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const segment = `/${location.pathname.split('/')[1] ?? ''}`
  const title = PAGE_TITLES[segment] ?? 'FOCUSLY'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setNotifOpen(false)
  }, [location.pathname])

  const crumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean)
    const list: Array<{ label: string; to?: string }> = [{ label: 'FOCUSLY', to: '/dashboard' }]
    let acc = ''
    for (const part of parts) {
      acc += `/${part}`
      list.push({ label: PAGE_TITLES[acc] ?? part.replace(/-/g, ' '), to: acc })
    }
    return list
  }, [location.pathname])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-line bg-surface/85 px-3 backdrop-blur-md sm:px-5">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Buka menu navigasi"
          className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 sm:flex">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="flex items-center gap-1.5 truncate">
              {i > 0 && <span className="text-line-strong">/</span>}
              {i === crumbs.length - 1 ? (
                <span className="truncate text-sm font-medium text-ink">{c.label}</span>
              ) : (
                <Link
                  to={c.to ?? '/dashboard'}
                  className="truncate text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {c.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
        <span className="truncate text-sm font-medium text-ink sm:hidden">{title}</span>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Search */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-9 w-56 items-center gap-2 rounded-xl border border-line bg-surface-2 px-3 text-left text-[13px] text-ink-muted transition-colors hover:border-line-strong md:flex"
          >
            <Search className="size-4" />
            <span className="flex-1">Cari tugas atau halaman…</span>
            <kbd className="rounded border border-line bg-surface px-1.5 py-px text-[10px] font-medium text-ink-muted">
              Ctrl K
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Cari"
            className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink md:hidden"
          >
            <Search className="size-5" />
          </button>

          {/* Theme */}
          <Tooltip content={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Ganti tema"
              className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </Tooltip>

          {/* Notifications */}
          <div className="relative">
            <Tooltip content="Notifikasi">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label={`Notifikasi${unread ? `, ${unread} belum dibaca` : ''}`}
                className="relative rounded-lg p-2 text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
            </Tooltip>
          </div>

          {/* Avatar menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1 rounded-xl p-1 pr-1.5 transition-colors hover:bg-surface-2"
              aria-label="Menu profil"
            >
              <Avatar avatarId={profile.avatarId} name={profile.displayName} size="sm" />
              <ChevronDown className="hidden size-3.5 text-ink-muted sm:block" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-pop animate-pop">
                <div className="border-b border-line px-4 py-3">
                  <div className="truncate text-sm font-semibold text-ink">{profile.displayName}</div>
                  <div className="truncate text-[12px] text-ink-muted">@{profile.username}</div>
                </div>
                <div className="p-1.5">
                  <MenuItem icon={<User className="size-4" />} onClick={() => navigate('/profile')}>
                    Profile
                  </MenuItem>
                  <MenuItem icon={<Settings className="size-4" />} onClick={() => navigate('/settings')}>
                    Settings
                  </MenuItem>
                  <MenuItem
                    icon={theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
                  </MenuItem>
                  <div className="my-1 border-t border-line" />
                  <MenuItem
                    icon={<LogOut className="size-4" />}
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/dashboard')
                    }}
                  >
                    Kembali ke Dashboard
                  </MenuItem>
                </div>
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="primary"
            className="hidden sm:inline-flex"
            onClick={() => navigate('/tasks?new=1')}
          >
            New Task
          </Button>
        </div>
      </header>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function MenuItem({
  icon,
  children,
  onClick,
}: {
  icon: ReactNode
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
    >
      <span className="text-ink-muted [&>svg]:size-4">{icon}</span>
      {children}
    </button>
  )
}
