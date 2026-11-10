import { useEffect } from 'react';
import { usePomodoroRuntimeStore } from '../store/usePomodoroRuntimeStore';
import { useFocusStore } from '../store/useFocusStore';
import { finishFocusSession } from '../services/actions';
import { toast } from '../store/useToastStore';
const TICK_MS = 250;
/**
 * Global tickers mounted once in the app layout.
 *
 * The Pomodoro countdown and the running Focus session are driven by wall
 * clock timestamps, so they stay accurate even when the tab is backgrounded.
 */
export function useAppTickers() {
    usePomodoroTicker();
    useFocusTicker();
}
function usePomodoroTicker() {
    useEffect(() => {
        const id = window.setInterval(() => {
            const state = usePomodoroRuntimeStore.getState();
            if (!state.running || state.endsAt === null)
                return;
            const remaining = state.endsAt - Date.now();
            if (remaining <= 0)
                state.handleComplete();
            else
                usePomodoroRuntimeStore.setState({ remainingMs: remaining });
        }, TICK_MS);
        return () => window.clearInterval(id);
    }, []);
}
function useFocusTicker() {
    useEffect(() => {
        const id = window.setInterval(() => {
            const { active } = useFocusStore.getState();
            if (!active || active.pausedAt)
                return;
            const started = new Date(active.startedAt).getTime();
            const elapsed = Date.now() - started - active.accumulatedPauseMs;
            const planned = active.plannedMinutes * 60_000;
            if (elapsed >= planned) {
                const session = finishFocusSession('completed');
                if (session) {
                    toast.success(`Sesi fokus ${session.actualMinutes} menit selesai`, 'Waktunya istirahat sejenak.');
                }
            }
        }, 1000);
        return () => window.clearInterval(id);
    }, []);
}
/** Remaining milliseconds for the running focus session (0 when idle). */
export function focusRemainingMs() {
    const active = useFocusStore.getState().active;
    if (!active)
        return 0;
    const base = new Date(active.startedAt).getTime() + active.plannedMinutes * 60_000;
    const paused = active.pausedAt ? Date.now() - new Date(active.pausedAt).getTime() : 0;
    return Math.max(0, base + active.accumulatedPauseMs + paused - Date.now());
}
