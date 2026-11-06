import { addDays } from 'date-fns';
import { dayKey } from '../../utils/date';
import { uid } from '../../utils/id';
export const DAILY_GOALS = [
    { id: 'focus_minutes', label: 'Focus time', target: 120, unit: 'minutes' },
    { id: 'tasks_done', label: 'Tugas selesai', target: 3, unit: 'tasks' },
    { id: 'pomodoro_sessions', label: 'Sesi Pomodoro', target: 4, unit: 'sessions' },
    { id: 'focus_sessions', label: 'Sesi fokus', target: 3, unit: 'sessions' },
];
/* ------------------------------------------------------------------ */
/*  XP curve                                                           */
/* ------------------------------------------------------------------ */
/** XP required to *reach* the given level (level 1 = 0 XP). */
export function xpToReachLevel(level) {
    let total = 0;
    for (let i = 1; i < level; i++)
        total += 100 + (i - 1) * 40;
    return total;
}
export function levelFromXp(xp) {
    let level = 1;
    while (xpToReachLevel(level + 1) <= xp && level < 999)
        level++;
    const base = xpToReachLevel(level);
    const next = xpToReachLevel(level + 1);
    const needed = next - base;
    const into = xp - base;
    return {
        level,
        into,
        needed,
        percent: needed <= 0 ? 100 : Math.min(100, Math.round((into / needed) * 100)),
        total: xp,
    };
}
export const XP_REWARDS = {
    focusSession: 25,
    focusSessionEarlyEnd: 10,
    taskCompleted: 40,
    pomodoroSession: 15,
    dailyGoalBonus: 60,
    levelUp: 100,
};
/* ------------------------------------------------------------------ */
/*  Seed helpers                                                       */
/* ------------------------------------------------------------------ */
function activityDatesSeed() {
    const keys = [];
    // Earlier run: 21 consecutive days, 30–50 days ago (longest streak)
    for (let i = 50; i >= 30; i--)
        keys.push(dayKey(addDays(new Date(), -i)));
    // Current run: 12 consecutive days up to today (current streak)
    for (let i = 11; i >= 0; i--)
        keys.push(dayKey(addDays(new Date(), -i)));
    return keys;
}
function goalProgressSeed() {
    const out = [];
    const today = new Date();
    for (let back = 6; back >= 0; back--) {
        const key = dayKey(addDays(today, -back));
        if (back === 0) {
            out.push({
                date: key,
                values: { focus_minutes: 85, tasks_done: 1, pomodoro_sessions: 2, focus_sessions: 2 },
            });
        }
        else if (back === 3) {
            // A lighter day — shows the goals are not fake-perfect
            out.push({
                date: key,
                values: { focus_minutes: 40, tasks_done: 1, pomodoro_sessions: 1, focus_sessions: 1 },
            });
        }
        else {
            out.push({
                date: key,
                values: { focus_minutes: 150, tasks_done: 3, pomodoro_sessions: 5, focus_sessions: 4 },
            });
        }
    }
    return out;
}
function logSeed() {
    const now = new Date();
    const at = (hoursAgo) => new Date(now.getTime() - hoursAgo * 3_600_000).toISOString();
    return [
        {
            id: uid('log'),
            type: 'focus',
            message: 'Menyelesaikan sesi fokus 50 menit untuk Tugas Besar Algoritma',
            xp: XP_REWARDS.focusSession,
            at: at(2),
        },
        {
            id: uid('log'),
            type: 'task',
            message: 'Menyelesaikan "Catatan Kuliah Statistika — Bab 3"',
            xp: XP_REWARDS.taskCompleted,
            at: at(5),
        },
        {
            id: uid('log'),
            type: 'goal',
            message: 'Mencapai target focus time harian',
            xp: XP_REWARDS.dailyGoalBonus,
            at: at(7),
        },
        {
            id: uid('log'),
            type: 'pomodoro',
            message: 'Menyelesaikan 4 sesi Pomodoro berturut-turut',
            xp: XP_REWARDS.pomodoroSession * 2,
            at: at(9),
        },
        {
            id: uid('log'),
            type: 'focus',
            message: 'Sesi fokus 25 menit dengan Do Not Disturb aktif',
            xp: XP_REWARDS.focusSession,
            at: at(49),
        },
        {
            id: uid('log'),
            type: 'task',
            message: 'Menyelesaikan "Ikut Sesi Mentoring Alumni"',
            xp: XP_REWARDS.taskCompleted,
            at: at(52),
        },
    ];
}
export function createSeedProgress() {
    return {
        xp: 5_420,
        activityDates: activityDatesSeed(),
        currentStreak: 12,
        longestStreak: 21,
        goalProgress: goalProgressSeed(),
        log: logSeed(),
    };
}
export function createSeedRestDays() {
    const today = new Date();
    return [
        { id: uid('rest'), date: dayKey(addDays(today, -8)), reason: 'Recovery setelah minggu ujian.' },
        { id: uid('rest'), date: dayKey(addDays(today, 5)), reason: 'Hari istirahat terjadwal.' },
    ];
}
