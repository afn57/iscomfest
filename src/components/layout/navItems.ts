export interface NavItem {
  to: string
  label: string
  icon: string
}

export const MAIN_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: '/tasks', label: 'My Tasks', icon: 'ListChecks' },
  { to: '/focus', label: 'Focus Mode', icon: 'Crosshair' },
  { to: '/calendar', label: 'Calendar', icon: 'CalendarDays' },
  { to: '/reminders', label: 'Reminders', icon: 'AlarmClock' },
  { to: '/achievements', label: 'Achievement', icon: 'Trophy' },
  { to: '/rewards', label: 'Rewards', icon: 'Gift' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'Medal' },
  { to: '/community', label: 'Community', icon: 'MessagesSquare' },
]

export const FOOTER_NAV: NavItem[] = [
  { to: '/profile', label: 'Profile', icon: 'User' },
  { to: '/settings', label: 'Settings', icon: 'Settings' },
]

export const SEARCHABLE_ROUTES: Array<NavItem & { description: string }> = [
  { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', description: 'Ringkasan aktivitas produktivitas' },
  { to: '/tasks', label: 'My Tasks', icon: 'ListChecks', description: 'Kelola tugas, folder, prioritas, deadline' },
  { to: '/focus', label: 'Focus Mode', icon: 'Crosshair', description: 'Sesi fokus, Focus Lock, riwayat' },
  { to: '/focus', label: 'Pomodoro Timer', icon: 'Timer', description: 'Timer 25/5/15 dengan siklus panjang' },
  { to: '/calendar', label: 'Calendar', icon: 'CalendarDays', description: 'Tampilan bulan, minggu, dan hari' },
  { to: '/reminders', label: 'Reminders', icon: 'AlarmClock', description: 'Pengingat deadline, fokus, dan streak' },
  { to: '/achievements', label: 'Achievement', icon: 'Trophy', description: 'Streak, badge, daily goal, Rest Day' },
  { to: '/rewards', label: 'Rewards', icon: 'Gift', description: 'Tukar coins dengan reward' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'Medal', description: 'Peringkat produktivitas teman' },
  { to: '/community', label: 'Community', icon: 'MessagesSquare', description: 'Diskusi dan berbagi tips' },
  { to: '/profile', label: 'Profile', icon: 'User', description: 'Kustomisasi profil dan showcase' },
  { to: '/settings', label: 'Settings', icon: 'Settings', description: 'Tema, notifikasi, preferensi fokus' },
]

export const PAGE_TITLES: Record<string, string> = Object.fromEntries(
  MAIN_NAV.concat(FOOTER_NAV).map((n) => [n.to, n.label]),
)
