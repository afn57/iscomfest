export const MAIN_NAV = [
    { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { to: '/tasks', label: 'My Tasks', icon: 'ListChecks' },
    { to: '/focus', label: 'Focus Mode', icon: 'Crosshair' },
    { to: '/calendar', label: 'Calendar', icon: 'CalendarDays' },
    { to: '/reminders', label: 'Reminders', icon: 'AlarmClock' },
    { to: '/streak', label: 'Streak', icon: 'Flame' },
];
export const FOOTER_NAV = [
    { to: '/profile', label: 'Profile', icon: 'User' },
    { to: '/settings', label: 'Settings', icon: 'Settings' },
];
export const SEARCHABLE_ROUTES = [
    { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', description: 'Ringkasan aktivitas produktivitas' },
    { to: '/tasks', label: 'My Tasks', icon: 'ListChecks', description: 'Kelola tugas, folder, prioritas, deadline' },
    { to: '/focus', label: 'Focus Mode', icon: 'Crosshair', description: 'Sesi fokus, Focus Lock, riwayat' },
    { to: '/calendar', label: 'Calendar', icon: 'CalendarDays', description: 'Tampilan bulan, minggu, dan hari' },
    { to: '/reminders', label: 'Reminders', icon: 'AlarmClock', description: 'Pengingat deadline, fokus, dan streak' },
    { to: '/streak', label: 'Streak', icon: 'Flame', description: 'Streak, heatmap, dan Rest Day' },
    { to: '/profile', label: 'Profile', icon: 'User', description: 'Statistik dan bio profil' },
    { to: '/settings', label: 'Settings', icon: 'Settings', description: 'Tema, notifikasi, preferensi fokus' },
];
export const PAGE_TITLES = Object.fromEntries(MAIN_NAV.concat(FOOTER_NAV).map((n) => [n.to, n.label]));
