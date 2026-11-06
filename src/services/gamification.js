import { DAILY_GOALS, levelFromXp, XP_REWARDS } from '../data/mock/gamification';
import { useNotificationStore } from '../store/useNotificationStore';
import { useProgressStore } from '../store/useProgressStore';
import { todayKey } from '../utils/date';
export { levelFromXp, DAILY_GOALS, XP_REWARDS };
/* ------------------------------------------------------------------ */
/*  Core awards                                                        */
/* ------------------------------------------------------------------ */
/** Awards XP, detecting level-ups. */
export function awardXp(amount, logMessage) {
    const before = levelFromXp(useProgressStore.getState().progress.xp).level;
    useProgressStore.getState().addXp(amount);
    const newLevel = levelFromXp(useProgressStore.getState().progress.xp).level;
    const leveledUp = newLevel > before;
    if (leveledUp) {
        useProgressStore.getState().pushLog({
            type: 'level',
            message: `Naik ke Level ${newLevel}`,
            xp: XP_REWARDS.levelUp,
        });
        useNotificationStore.getState().push({
            kind: 'system',
            title: `Level ${newLevel} tercapai`,
            body: 'Konsistensi kamu terbayar. Teruskan ritmenya.',
            href: '/streak',
            dedupe: `level:${newLevel}`,
        });
    }
    if (logMessage) {
        useProgressStore.getState().pushLog({ type: 'focus', message: logMessage, xp: amount });
    }
    return { xp: amount, leveledUp, newLevel };
}
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
/** Bumps a daily goal counter and pays the bonus once per goal per day. */
export function bumpGoal(goalId, delta) {
    const key = todayKey();
    useProgressStore.getState().bumpGoalValue(goalId, delta);
    const entry = useProgressStore.getState().progress.goalProgress.find((g) => g.date === key);
    const value = entry?.values[goalId] ?? 0;
    const goal = DAILY_GOALS.find((g) => g.id === goalId);
    if (!goal)
        return { justMet: false };
    const awarded = entry?.awarded ?? [];
    if (value < goal.target || awarded.includes(goalId))
        return { justMet: false };
    useProgressStore.setState((s) => ({
        progress: {
            ...s.progress,
            goalProgress: s.progress.goalProgress.map((g) => g.date === key ? { ...g, awarded: [...(g.awarded ?? []), goalId] } : g),
        },
    }));
    awardXp(XP_REWARDS.dailyGoalBonus);
    useProgressStore.getState().pushLog({
        type: 'goal',
        message: `Mencapai target harian "${goal.label}"`,
        xp: XP_REWARDS.dailyGoalBonus,
    });
    useNotificationStore.getState().push({
        kind: 'streak',
        title: 'Daily goal tercapai',
        body: `"${goal.label}" selesai. +${XP_REWARDS.dailyGoalBonus} XP.`,
        href: '/streak',
        dedupe: `goal:${goalId}:${key}`,
    });
    return { justMet: true };
}