import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, NotificationSettings, PrivacySettings, ThemeMode } from '../types'

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  reduceMotion: false,
  compactSidebar: false,
  notifications: {
    deadlines: true,
    overdue: true,
    focusReminders: true,
    streakWarnings: true,
    rewardUpdates: true,
    dailyDigest: false,
  },
  privacy: {
    showInLeaderboard: true,
    shareFocusTime: true,
    communityComments: true,
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
}

interface SettingsState {
  settings: AppSettings
  update: (patch: Partial<AppSettings>) => void
  updateSection: <K extends 'notifications' | 'privacy' | 'focus' | 'restDay'>(
    key: K,
    patch: Partial<AppSettings[K]>,
  ) => void
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  reset: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      updateSection: (key, patch) =>
        set((s) => ({
          settings: { ...s.settings, [key]: { ...s.settings[key], ...patch } },
        })),
      setTheme: (theme) => set((s) => ({ settings: { ...s.settings, theme } })),
      toggleTheme: () =>
        set((s) => ({
          settings: { ...s.settings, theme: s.settings.theme === 'dark' ? 'light' : 'dark' },
        })),
      reset: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: 'focusly_settings', version: 1 },
  ),
)

export const selectNotifications = (s: SettingsState): NotificationSettings =>
  s.settings.notifications
export const selectPrivacy = (s: SettingsState): PrivacySettings => s.settings.privacy
