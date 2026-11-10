import { XP_REWARDS } from '../data/mock/gamification';
import { useCalendarStore } from '../store/useCalendarStore';
import { useFocusStore } from '../store/useFocusStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useProgressStore } from '../store/useProgressStore';
import { useTaskStore } from '../store/useTaskStore';
import { toast } from '../store/useToastStore';
import { deadlineUrgency } from '../utils/date';
import { awardXp, bumpGoal, recordProductiveDay, } from './gamification';
/* ------------------------------------------------------------------ */
/*  Tasks                                                              */
/* ------------------------------------------------------------------ */
export function completeTaskWithVerification(task, input) {
    const verification = { ...input, verifiedAt: new Date().toISOString() };
    useTaskStore.getState().complete(task.id, verification);
    awardXp(XP_REWARDS.taskCompleted);
    recordProductiveDay();
    bumpGoal('tasks_done', 1);
    useProgressStore.getState().pushLog({
        type: 'task',
        message: `Menyelesaikan "${task.title}"`,
        xp: XP_REWARDS.taskCompleted,
    });
    useNotificationStore.getState().push({
        kind: 'system',
        title: 'Tugas selesai',
        body: `"${task.title}" ditandai Completed.`,
        href: '/tasks',
    });
    const urgency = deadlineUrgency(task.deadline, task.status);
    const bonus = urgency === 'overdue'
        ? 'Tugas ini sudah terlambat — bagus sudah diselesaikan.'
        : 'Kerja bagus, satu tugas lebih ringan.';
    toast.success('Tugas diselesaikan', `+${XP_REWARDS.taskCompleted} XP · ${bonus}`);
}
export function startFocusSession(input) {
    useFocusStore.getState().start(input);
    useNotificationStore.getState().push({
        kind: 'focus',
        title: 'Focus Mode aktif',
        body: `${input.plannedMinutes} menit dimulai${input.dnd ? ' dengan Do Not Disturb' : ''}.`,
        dedupe: `focus-start:${Date.now()}`,
    });
}
export function finishFocusSession(status) {
    const session = useFocusStore.getState().end(status);
    if (!session)
        return null;
    const completed = session.status === 'completed';
    const dndBonus = session.dnd ? 0 : -5;
    if (completed) {
        awardXp(XP_REWARDS.focusSession);
        bumpGoal('focus_minutes', session.actualMinutes);
        bumpGoal('focus_sessions', 1);
        if (session.dnd)
            recordProductiveDay();
        useProgressStore.getState().pushLog({
            type: 'focus',
            message: `Menyelesaikan sesi fokus ${session.actualMinutes} menit${session.dnd ? ' dengan Do Not Disturb aktif' : ''}`,
            xp: XP_REWARDS.focusSession,
        });
        toast.success(`Sesi fokus ${session.actualMinutes} menit selesai`, session.dnd
            ? `+${XP_REWARDS.focusSession} XP · DND aktif, streak hari ini aman.`
            : `+${XP_REWARDS.focusSession} XP · DND nonaktif (streak butuh DND atau daily goal).`);
    }
    else {
        awardXp(Math.max(5, XP_REWARDS.focusSessionEarlyEnd + dndBonus));
        toast.info('Sesi diakhiri lebih awal', `${session.actualMinutes} menit tercatat. Mulai lagi kapan saja.`);
    }
    useNotificationStore.getState().push({
        kind: 'focus',
        title: completed ? 'Sesi fokus selesai' : 'Sesi fokus diakhiri',
        body: `${session.actualMinutes} menit tercatat.`,
        href: '/focus',
    });
    return session;
}
/* ------------------------------------------------------------------ */
/*  Rest day                                                           */
/* ------------------------------------------------------------------ */
export function scheduleRestDay(date, reason) {
    useCalendarStore.getState().addRestDay(date, reason);
    const existing = useCalendarStore.getState().events.find((e) => e.date === date && e.type === 'rest');
    if (!existing) {
        useCalendarStore.getState().addEvent({
            title: 'Rest Day',
            type: 'rest',
            date,
            note: reason ?? 'Istirahat terjadwal — streak tetap aman.',
        });
    }
    useProgressStore.getState().recomputeStreak();
    useProgressStore.getState().pushLog({
        type: 'rest',
        message: `Menjadwalkan Rest Day${reason ? ` — ${reason}` : ''}`,
    });
    useNotificationStore.getState().push({
        kind: 'system',
        title: 'Rest Day dijadwalkan',
        body: 'Istirahat tidak mengurangi streak selama dijadwalkan lewat fitur ini.',
        href: '/streak',
    });
    toast.info('Rest Day dijadwalkan', 'Istirahat itu bagian dari rencana, bukan pelarian.');
}
export function cancelRestDay(date) {
    useCalendarStore.getState().removeRestDayByDate(date);
    useCalendarStore
        .getState()
        .events.filter((e) => e.date === date && e.type === 'rest')
        .forEach((e) => useCalendarStore.getState().removeEvent(e.id));
    useProgressStore.getState().recomputeStreak();
}
