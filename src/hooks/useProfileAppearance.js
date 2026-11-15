import { useEffect } from 'react';
import { BACKGROUNDS, PROFILE_THEMES } from '../data/mock/profile';
import { useProfileStore } from '../store/useProfileStore';
/**
 * Applies the profile's cosmetic choices globally:
 * - `backgroundId` paints the app shell via --profile-bg
 * - `themeId` overrides the primary accent palette
 */
export function useProfileAppearance() {
    const backgroundId = useProfileStore((s) => s.profile.backgroundId);
    const themeId = useProfileStore((s) => s.profile.themeId);
    useEffect(() => {
        const root = document.documentElement;
        const bg = BACKGROUNDS.find((b) => b.id === backgroundId) ?? BACKGROUNDS[0];
        root.style.setProperty('--profile-bg', bg.css);
        const theme = PROFILE_THEMES.find((t) => t.id === themeId) ?? PROFILE_THEMES[0];
        root.style.setProperty('--primary', theme.accent);
        root.style.setProperty('--primary-soft', theme.soft);
        root.style.setProperty('--primary-strong', `color-mix(in srgb, ${theme.accent} 84%, black)`);
    }, [backgroundId, themeId]);
}
