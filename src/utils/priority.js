import { deadlineUrgency } from './date';
export const PRIORITY_META = {
    urgent: {
        label: 'Urgent',
        short: 'URG',
        className: 'bg-danger-soft text-danger border-danger/30',
        dot: 'bg-danger',
        weight: 4,
    },
    high: {
        label: 'High',
        short: 'HIGH',
        className: 'bg-warning-soft text-warning border-warning/30',
        dot: 'bg-warning',
        weight: 3,
    },
    medium: {
        label: 'Medium',
        short: 'MED',
        className: 'bg-accent-soft text-accent border-accent/30',
        dot: 'bg-accent',
        weight: 2,
    },
    low: {
        label: 'Low',
        short: 'LOW',
        className: 'bg-primary-soft text-primary border-primary/30',
        dot: 'bg-primary',
        weight: 1,
    },
};
export const STATUS_META = {
    todo: {
        label: 'To Do',
        className: 'bg-surface-3 text-ink-soft border-line-strong',
        dot: 'bg-ink-muted',
    },
    in_progress: {
        label: 'In Progress',
        className: 'bg-accent-soft text-accent border-accent/30',
        dot: 'bg-accent',
    },
    completed: {
        label: 'Completed',
        className: 'bg-success-soft text-success border-success/30',
        dot: 'bg-success',
    },
};
export const PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low'];
/**
 * Minimum priority derived from how close a deadline is.
 * Overdue/today (critical) -> urgent, within 3 days (soon) -> high.
 * Returns null when the deadline is far enough away to not escalate.
 */
export function deadlinePriority(task) {
    const urgency = deadlineUrgency(task.deadline, task.status);
    if (urgency === 'overdue' || urgency === 'critical')
        return 'urgent';
    if (urgency === 'soon')
        return 'high';
    return null;
}
/**
 * Effective priority for display/sort/filter: the higher of the manual
 * priority and the deadline-derived one. Escalates only, never lowers,
 * and never mutates the stored task.
 */
export function effectivePriority(task) {
    const floor = deadlinePriority(task);
    if (!floor)
        return task.priority;
    return PRIORITY_ORDER.indexOf(task.priority) < PRIORITY_ORDER.indexOf(floor)
        ? task.priority
        : floor;
}
export const STATUS_ORDER = ['todo', 'in_progress', 'completed'];
export const FOLDER_COLORS = [
    '#7c5cff',
    '#22d3ee',
    '#34d399',
    '#fbbf24',
    '#f87171',
    '#5b8cff',
    '#f472b6',
    '#a3e635',
];
/** Sort by: overdue first, then deadline asc, then priority weight desc. */
export function compareTasks(a, b) {
    const aDone = a.status === 'completed' ? 1 : 0;
    const bDone = b.status === 'completed' ? 1 : 0;
    if (aDone !== bDone)
        return aDone - bDone;
    const d = a.deadline.localeCompare(b.deadline);
    if (d !== 0)
        return d;
    return PRIORITY_ORDER.indexOf(effectivePriority(b)) - PRIORITY_ORDER.indexOf(effectivePriority(a));
}
