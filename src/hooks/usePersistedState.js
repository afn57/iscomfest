import { useCallback, useState } from 'react';
/** useState mirrored into localStorage so UI preferences survive refresh. */
export function usePersistedState(key, initial) {
    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? initial : JSON.parse(raw);
        }
        catch {
            return initial;
        }
    });
    const set = useCallback((next) => {
        setValue((prev) => {
            const resolved = typeof next === 'function' ? next(prev) : next;
            try {
                localStorage.setItem(key, JSON.stringify(resolved));
            }
            catch {
                /* storage full or blocked — value still updates in memory */
            }
            return resolved;
        });
    }, [key]);
    return [value, set];
}
