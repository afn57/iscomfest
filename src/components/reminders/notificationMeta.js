import { AlertTriangle, Clock, Flame, Info, Crosshair, } from 'lucide-react';
export const KIND_META = {
    deadline: { icon: Clock, tone: 'text-warning bg-warning-soft' },
    overdue: { icon: AlertTriangle, tone: 'text-danger bg-danger-soft' },
    focus: { icon: Crosshair, tone: 'text-primary bg-primary-soft' },
    streak: { icon: Flame, tone: 'text-warning bg-warning-soft' },
    system: { icon: Info, tone: 'text-ink-soft bg-surface-3' },
};
export const KIND_LABEL = {
    deadline: 'Deadline',
    overdue: 'Terlambat',
    focus: 'Focus',
    streak: 'Streak',
    system: 'Sistem',
};
export const NOTIFICATION_KINDS = [
    'deadline',
    'overdue',
    'focus',
    'streak',
    'system',
];