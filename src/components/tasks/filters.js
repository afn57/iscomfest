import { compareTasks, effectivePriority, PRIORITY_ORDER } from '../../utils/priority';
import { deadlineUrgency } from '../../utils/date';
export const DEFAULT_FILTERS = {
    query: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    deadline: 'all',
    sort: 'deadline',
};
export function isFilterActive(filter) {
    return (filter.query.trim() !== '' ||
        filter.status !== 'all' ||
        filter.priority !== 'all' ||
        filter.category !== 'all' ||
        filter.deadline !== 'all');
}
export function applyFilters(tasks, filter) {
    const q = filter.query.trim().toLowerCase();
    const now = Date.now();
    const week = now + 7 * 86_400_000;
    const filtered = tasks.filter((t) => {
        if (q) {
            const haystack = `${t.title} ${t.description} ${t.category}`.toLowerCase();
            if (!haystack.includes(q))
                return false;
        }
        if (filter.status !== 'all' && t.status !== filter.status)
            return false;
        if (filter.priority !== 'all' && effectivePriority(t) !== filter.priority)
            return false;
        if (filter.category !== 'all' && t.category !== filter.category)
            return false;
        if (filter.deadline !== 'all') {
            const time = new Date(t.deadline).getTime();
            switch (filter.deadline) {
                case 'overdue':
                    if (deadlineUrgency(t.deadline, t.status) !== 'overdue')
                        return false;
                    break;
                case 'today': {
                    const d = new Date(t.deadline);
                    const today = new Date();
                    if (d.getDate() !== today.getDate() ||
                        d.getMonth() !== today.getMonth() ||
                        d.getFullYear() !== today.getFullYear())
                        return false;
                    break;
                }
                case 'week':
                    if (time < now || time > week)
                        return false;
                    break;
                case 'upcoming':
                    if (time < now)
                        return false;
                    break;
            }
        }
        return true;
    });
    return filtered.sort((a, b) => {
        switch (filter.sort) {
            case 'priority': {
                const d = PRIORITY_ORDER.indexOf(effectivePriority(a)) - PRIORITY_ORDER.indexOf(effectivePriority(b));
                return d !== 0 ? d : a.deadline.localeCompare(b.deadline);
            }
            case 'created':
                return b.createdAt.localeCompare(a.createdAt);
            case 'title':
                return a.title.localeCompare(b.title, 'id');
            case 'deadline':
            default:
                return compareTasks(a, b);
        }
    });
}
