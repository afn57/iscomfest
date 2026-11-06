import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const DEFAULT_SETTINGS = {
    theme: 'dark',
    reduceMotion: false,
    compactSidebar: false,
    notifications: {
        deadlines: true,
        overdue: true,
        focusReminders: true,
        streakWarnings: true,
        dailyDigest: false,
    },
    focus: {
        defaultMinutes: 50,
        dndDefault: true,
        autoLockThresholdHours: 24,
        autoLockEnabled: true,
        showLockBanner: true,
    },
    restDay: {
        weeklyEnabled: true,
        weeklyDay: 0,
        protectStreak: true,
        recommendAfterDays: 6,
    },
};
export const useSettingsStore = create()(persist((set) => ({
    settings: DEFAULT_SETTINGS,
    update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
    updateSection: (key, patch) => set((s) => ({
        settings: { ...s.settings, [key]: { ...s.settings[key], ...patch } },
    })),
    setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
    toggleTheme: () => set((s) => ({
        settings: { ...s.settings, theme: s.settings.theme === 'dark' ? 'light' : 'dark' },
    })),
    reset: () => set({ settings: DEFAULT_SETTINGS }),
}), {
    name: 'focusly_settings',
    version: 2,
    migrate: (persisted) => {
        const s = persisted?.settings;
        if (!s)
            return persisted;
        const { rewardUpdates: _rewardUpdates, ...notifications } = s.notifications ?? {};
        const { showInLeaderboard: _a, shareFocusTime: _b, communityComments: _c, ...rest } = s;
        return { settings: { ...rest, notifications } };
    },
}));
export const selectNotifications = (s) => s.settings.notifications;
