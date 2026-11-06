/**
 * Streak rules for FOCUSLY.
 *
 * A day counts as "active" when the user completes a qualifying activity
 * (focus session with DND, full daily goal, or a completed task) — never
 * merely by pressing Start.
 *
 * Rest Days are *neutral*: they neither add nor break a streak, as long as
 * they were scheduled through the Rest Day feature.
 */
import { dayKey, todayKey } from './date';
const DAY_MS = 86_400_000;
function shift(key, delta) {
    return dayKey(new Date(new Date(`${key}T00:00:00`).getTime() + delta * DAY_MS));
}
function longestRun(active, rest) {
    const all = [...new Set([...active, ...rest])].sort();
    let best = 0;
    let run = 0;
    let prev = null;
    for (const key of all) {
        if (prev !== null && shift(prev, 1) !== key)
            run = 0;
        if (active.has(key))
            run++;
        best = Math.max(best, run);
        prev = key;
    }
    return best;
}
export function computeStreaks(activityDates, restDates = []) {
    const active = new Set(activityDates);
    const rest = new Set(restDates);
    if (active.size === 0)
        return { current: 0, longest: 0 };
    const today = todayKey();
    const yesterday = shift(today, -1);
    let start = null;
    if (active.has(today) || rest.has(today))
        start = today;
    else if (active.has(yesterday) || rest.has(yesterday))
        start = yesterday;
    let current = 0;
    if (start) {
        let cursor = start;
        let guard = 0;
        while (guard++ < 4000) {
            if (active.has(cursor))
                current++;
            else if (!rest.has(cursor))
                break;
            cursor = shift(cursor, -1);
        }
    }
    return { current, longest: Math.max(longestRun(active, rest), current) };
}
/** Rest days can only be scheduled for today or a future date. */
export function isRestDayEligible(dateKey) {
    return dateKey >= todayKey();
}
