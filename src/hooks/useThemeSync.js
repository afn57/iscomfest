import { useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
/**
 * Applies the selected theme to the document root and keeps the browser
 * chrome colour in sync. Dark is the default theme of FOCUSLY.
 */
export function useThemeSync() {
    const theme = useSettingsStore((s) => s.settings.theme);
    const reduceMotion = useSettingsStore((s) => s.settings.reduceMotion);
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        root.classList.toggle('light', theme === 'light');
        root.style.colorScheme = theme;
        const meta = document.querySelector('meta[name="theme-color"]');
        meta?.setAttribute('content', theme === 'dark' ? '#0a0e1a' : '#f4f6fc');
    }, [theme]);
    useEffect(() => {
        document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    }, [reduceMotion]);
}
