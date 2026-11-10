import { useEffect } from 'react';
import { useFocusStore } from '../store/useFocusStore';
import { finishFocusSession } from '../services/actions';
import { toast } from '../store/useToastStore';
/**
 * Global tickers mounted once in the app layout.
 *
 * The running Focus session is driven by a wall clock timestamp, so it stays
 * accurate even when the tab is backgrounded.
 */
export function useAppTickers() {
    useFocusTicker();
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
