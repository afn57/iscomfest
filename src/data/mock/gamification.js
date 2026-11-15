import { addDays } from 'date-fns';
import { dayKey } from '../../utils/date';
import { uid } from '../../utils/id';
export const DAILY_GOALS = [
    { id: 'focus_minutes', label: 'Focus time', target: 120, unit: 'minutes' },
    { id: 'tasks_done', label: 'Tugas selesai', target: 3, unit: 'tasks' },
    { id: 'focus_sessions', label: 'Sesi fokus', target: 3, unit: 'sessions' },
];
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
                values: { focus_minutes: 85, tasks_done: 1, focus_sessions: 2 },
            });
        }
        else if (back === 3) {
            // A lighter day — shows the goals are not fake-perfect
            out.push({
                date: key,
                values: { focus_minutes: 40, tasks_done: 1, focus_sessions: 1 },
            });
        }
        else {
            out.push({
                date: key,
                values: { focus_minutes: 150, tasks_done: 3, focus_sessions: 4 },
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
            at: at(2),
        },
        {
            id: uid('log'),
            type: 'task',
            message: 'Menyelesaikan "Catatan Kuliah Statistika — Bab 3"',
            at: at(5),
        },
        {
            id: uid('log'),
            type: 'goal',
            message: 'Mencapai target focus time harian',
            at: at(7),
        },
        {
            id: uid('log'),
            type: 'focus',
            message: 'Sesi fokus 25 menit dengan Do Not Disturb aktif',
            at: at(49),
        },
        {
            id: uid('log'),
            type: 'task',
            message: 'Menyelesaikan "Ikut Sesi Mentoring Alumni"',
            at: at(52),
        },
    ];
}
export function createSeedProgress() {
    return {
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
