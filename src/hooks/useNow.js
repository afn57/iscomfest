import { useEffect, useState } from 'react';
/** Re-renders on an interval so countdown UIs stay in sync with the clock. */
export function useNow(intervalMs = 1000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        if (intervalMs <= 0)
            return;
        const id = window.setInterval(() => setNow(Date.now()), intervalMs);
        return () => window.clearInterval(id);
    }, [intervalMs]);
    return now;
}
