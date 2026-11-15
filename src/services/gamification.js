import { DAILY_GOALS } from '../data/mock/gamification';
import { useNotificationStore } from '../store/useNotificationStore';
import { useProgressStore } from '../store/useProgressStore';
import { todayKey } from '../utils/date';
export { DAILY_GOALS };
/**
 * Records today as a productive day. Call this only after the user actually
 * *finished* something — never on Start.
 */
export function recordProductiveDay() {
    useProgressStore.getState().recordActivity();
}
/* ------------------------------------------------------------------ */
/*  Daily goals                                                        */
/* ------------------------------------------------------------------ */
export function todayGoalValues() {
    const key = todayKey();
    return (useProgressStore.getState().progress.goalProgress.find((g) => g.date === key)?.values ?? {});
}
export function goalStatuses() {
    const values = todayGoalValues();
    return DAILY_GOALS.map((goal) => {
        const value = values[goal.id] ?? 0;
        const met = value >= goal.target;
        return {
            goal,
            value,
            percent: Math.min(100, Math.round((value / goal.target) * 100)),
            met,
        };
    });
}
export function allGoalsMet() {
    const statuses = goalStatuses();
    return statuses.length > 0 && statuses.every((s) => s.met);
}
export function goalValue(goalId) {
    return todayGoalValues()[goalId] ?? 0;
}
/** Updates a daily goal counter and announces the first completion each day. */
export function bumpGoal(goalId, delta) {
    const key = todayKey();
    useProgressStore.getState().bumpGoalValue(goalId, delta);
    const entry = useProgressStore.getState().progress.goalProgress.find((g) => g.date === key);
    const value = entry?.values[goalId] ?? 0;
    const goal = DAILY_GOALS.find((g) => g.id === goalId);
    if (!goal)
        return { justMet: false };
    const notified = entry?.notified ?? entry?.awarded ?? [];
    if (value < goal.target || notified.includes(goalId))
        return { justMet: false };
    useProgressStore.setState((s) => ({
        progress: {
            ...s.progress,
            goalProgress: s.progress.goalProgress.map((g) => g.date === key ? { ...g, notified: [...(g.notified ?? g.awarded ?? []), goalId] } : g),
        },
    }));
    useProgressStore.getState().pushLog({
        type: 'goal',
        message: `Mencapai target harian "${goal.label}"`,
    });
    useNotificationStore.getState().push({
        kind: 'streak',
        title: 'Daily goal tercapai',
        body: `"${goal.label}" selesai. Pertahankan ritme baikmu.`,
        href: '/streak',
        dedupe: `goal:${goalId}:${key}`,
    });
    return { justMet: true };
}
