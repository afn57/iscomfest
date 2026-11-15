import { create } from 'zustand';
import { selectAllApps, useFocusStore } from '../store/useFocusStore';
export const useFocusGuardStore = create(() => ({ connected: false }));
function post(message) {
    window.postMessage({ source: 'focusguard-web', ...message }, '*');
}
/** Akhir sesi absolut, konsisten dengan focusRemainingMs() di useTickers. */
export function focusEndsAt(active) {
    const base = new Date(active.startedAt).getTime() + active.plannedMinutes * 60_000;
    const paused = active.pausedAt ? Date.now() - new Date(active.pausedAt).getTime() : 0;
    return base + active.accumulatedPauseMs + paused;
}
function restrictedHosts(active) {
    const { customApps } = useFocusStore.getState();
    return selectAllApps({ customApps })
        .filter((a) => active.restrictedAppIds.includes(a.id))
        .map((a) => a.host);
}
function sync() {
    const { active } = useFocusStore.getState();
    if (active && active.restrictedAppIds.length > 0) {
        post({ type: 'START', hosts: restrictedHosts(active), endsAt: focusEndsAt(active) });
    }
    else {
        post({ type: 'STOP' });
    }
}
let initialized = false;
/** Pasang listener ekstensi + sinkron awal. Panggil sekali dari AppLayout. */
export function initFocusGuard() {
    if (initialized)
        return;
    initialized = true;
    window.addEventListener('message', (event) => {
        if (event.source !== window)
            return;
        const data = event.data;
        if (!data || data.source !== 'focusguard-ext')
            return;
        if (data.type === 'HELLO_ACK' || data.type === 'START_ACK') {
            useFocusGuardStore.setState({ connected: true });
        }
    });
    post({ type: 'HELLO' });
    // handshake ulang berkala — ekstensi bisa terpasang/refresh setelah website dibuka
    const retry = window.setInterval(() => {
        if (useFocusGuardStore.getState().connected) {
            window.clearInterval(retry);
            return;
        }
        post({ type: 'HELLO' });
    }, 3000);
    window.setTimeout(() => window.clearInterval(retry), 60_000);
    useFocusStore.subscribe(sync);
    sync();
}
