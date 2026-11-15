import { uid } from '../../utils/id';
import { SEED_TASKS } from './tasks';
export const RESTRICTED_APPS = [
    { id: 'instagram', name: 'Instagram', kind: 'social', host: 'instagram.com' },
    { id: 'tiktok', name: 'TikTok', kind: 'social', host: 'tiktok.com' },
    { id: 'youtube', name: 'YouTube', kind: 'video', host: 'youtube.com' },
    { id: 'facebook', name: 'Facebook', kind: 'social', host: 'facebook.com' },
    { id: 'x', name: 'X (Twitter)', kind: 'social', host: 'x.com' },
    { id: 'reddit', name: 'Reddit', kind: 'forum', host: 'reddit.com' },
];
export const DEFAULT_SCHEDULES = [
    {
        id: uid('sch'),
        label: 'Pagi belajar',
        startMinute: 7 * 60,
        durationMinutes: 50,
        days: [1, 2, 3, 4, 5],
        enabled: true,
    },
    {
        id: uid('sch'),
        label: 'Sore — tugas kampus',
        startMinute: 16 * 60,
        durationMinutes: 50,
        days: [1, 2, 3, 4],
        enabled: true,
    },
    {
        id: uid('sch'),
        label: 'Malam review',
        startMinute: 20 * 60,
        durationMinutes: 25,
        days: [0, 6],
        enabled: false,
    },
];
const now = new Date();
function hoursAgoIso(hours) {
    return new Date(now.getTime() - hours * 3_600_000).toISOString();
}
export function createSeedFocusSessions() {
    const specs = [
        { hoursAgo: 3, planned: 50, actual: 50, taskId: 'task_02', status: 'completed', dnd: true },
        { hoursAgo: 6, planned: 25, actual: 25, taskId: 'task_01', status: 'completed', dnd: true },
        { hoursAgo: 9, planned: 25, actual: 18, taskId: 'task_07', status: 'ended_early', dnd: false },
        { hoursAgo: 27, planned: 50, actual: 50, taskId: 'task_09', status: 'completed', dnd: true },
        { hoursAgo: 31, planned: 25, actual: 25, status: 'completed', dnd: true },
        { hoursAgo: 50, planned: 50, actual: 44, taskId: 'task_04', status: 'ended_early', dnd: true },
        { hoursAgo: 53, planned: 25, actual: 25, taskId: 'task_03', status: 'completed', dnd: false },
        { hoursAgo: 74, planned: 50, actual: 50, taskId: 'task_02', status: 'completed', dnd: true },
        { hoursAgo: 78, planned: 25, actual: 25, status: 'completed', dnd: true },
        { hoursAgo: 99, planned: 50, actual: 50, taskId: 'task_08', status: 'completed', dnd: true },
        { hoursAgo: 122, planned: 25, actual: 25, status: 'completed', dnd: true },
        { hoursAgo: 147, planned: 50, actual: 32, taskId: 'task_05', status: 'ended_early', dnd: false },
    ];
    return specs.map((s) => {
        const startedAt = hoursAgoIso(s.hoursAgo);
        const endedAt = new Date(new Date(startedAt).getTime() + s.actual * 60_000).toISOString();
        return {
            id: uid('fs'),
            taskId: s.taskId,
            startedAt,
            endedAt,
            plannedMinutes: s.planned,
            actualMinutes: s.actual,
            status: s.status,
            dnd: s.dnd,
            restrictedAppIds: s.dnd && s.taskId ? ['instagram', 'tiktok', 'youtube'] : s.dnd ? ['instagram', 'youtube'] : [],
        };
    });
}
export const SEED_RELATED_TASK_ID = SEED_TASKS[1].id;
