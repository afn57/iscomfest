/* ------------------------------------------------------------------
   FOCUSLY domain types
------------------------------------------------------------------ */

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type VerificationMethod = 'self' | 'evidence' | 'note'

export interface Folder {
  id: string
  name: string
  color: string
}

export interface TaskVerification {
  method: VerificationMethod
  evidenceName?: string
  evidenceSize?: number
  note?: string
  verifiedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  category: string
  folderId: string
  priority: Priority
  status: TaskStatus
  /** ISO date-time string */
  deadline: string
  estimateMinutes: number
  createdAt: string
  updatedAt: string
  completedAt?: string
  verification?: TaskVerification
}

export interface TaskDraft {
  title: string
  description: string
  category: string
  folderId: string
  priority: Priority
  status: TaskStatus
  deadline: string
  estimateMinutes: number
}

/* ------------------------------ Focus ----------------------------- */

export type FocusSessionStatus = 'completed' | 'ended_early'

export interface FocusSession {
  id: string
  taskId?: string
  startedAt: string
  endedAt: string
  plannedMinutes: number
  actualMinutes: number
  status: FocusSessionStatus
  dnd: boolean
  restrictedAppIds: string[]
}

export interface FocusSchedule {
  id: string
  label: string
  /** minutes from midnight */
  startMinute: number
  durationMinutes: number
  days: number[] // 0 = Sunday
  enabled: boolean
}

export interface RestrictedApp {
  id: string
  name: string
  kind: 'social' | 'video' | 'forum' | 'custom'
  host: string
}

export type LockStatus = 'inactive' | 'active' | 'simulated'

export interface ActiveFocus {
  id: string
  taskId?: string
  startedAt: string
  plannedMinutes: number
  dnd: boolean
  restrictedAppIds: string[]
  pausedAt?: string
  accumulatedPauseMs: number
}

/* ---------------------------- Pomodoro ---------------------------- */

export type PomodoroPhase = 'focus' | 'short_break' | 'long_break'

export interface PomodoroSettings {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  sessionsBeforeLongBreak: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  soundEnabled: boolean
}

export interface PomodoroRecord {
  id: string
  phase: PomodoroPhase
  minutes: number
  completedAt: string
  taskId?: string
  cycleIndex: number
  finishedNaturally: boolean
}

/* --------------------------- Gamification -------------------------- */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold'
  requirement: string
}

export interface UnlockedAchievement {
  id: string
  unlockedAt: string
}

export interface DailyGoal {
  id: string
  label: string
  target: number
  unit: 'minutes' | 'tasks' | 'sessions'
}

export interface DailyGoalProgress {
  /** yyyy-MM-dd */
  date: string
  values: Record<string, number>
  /** Goal ids that already paid out their bonus XP for this day. */
  awarded?: string[]
}

export interface ActivityLogEntry {
  id: string
  type: 'focus' | 'task' | 'goal' | 'reward' | 'level' | 'achievement' | 'rest' | 'pomodoro'
  message: string
  xp?: number
  at: string
}

export interface RestDay {
  id: string
  /** yyyy-MM-dd */
  date: string
  reason?: string
}

/* ------------------------------ Rewards ---------------------------- */

export type RewardCategory = 'theme' | 'avatar' | 'badge' | 'frame' | 'background'

export interface Reward {
  id: string
  name: string
  description: string
  cost: number
  category: RewardCategory
  icon: string
}

export interface Redemption {
  id: string
  rewardId: string
  rewardName: string
  cost: number
  redeemedAt: string
}

/* ----------------------------- Calendar ---------------------------- */

export type CalendarEventType = 'deadline' | 'focus' | 'completed' | 'event' | 'rest'

export interface CalendarEvent {
  id: string
  title: string
  type: CalendarEventType
  /** yyyy-MM-dd */
  date: string
  startMinute?: number
  endMinute?: number
  note?: string
  taskId?: string
}

/* --------------------------- Notifications ------------------------- */

export type NotificationKind = 'deadline' | 'overdue' | 'focus' | 'streak' | 'reward' | 'system' | 'achievement'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  at: string
  read: boolean
  href?: string
  /** Stable identifier used by the reminder engine to avoid duplicates. */
  dedupe?: string
}

/* ------------------------------ Profile ---------------------------- */

export interface Profile {
  username: string
  displayName: string
  bio: string
  avatarId: string
  bannerId: string
  themeId: string
  backgroundId: string
  showcase: string[] // achievement ids, max 3
  joinedAt: string
}

export interface Progress {
  xp: number
  coins: number
  /** yyyy-MM-dd strings on which the user earned a streak point */
  activityDates: string[]
  currentStreak: number
  longestStreak: number
  unlocked: UnlockedAchievement[]
  goalProgress: DailyGoalProgress[]
  log: ActivityLogEntry[]
}

/* ---------------------------- Leaderboard -------------------------- */

export type LeaderboardMetric = 'xp' | 'focus' | 'streak' | 'daily'

export interface LeaderboardUser {
  id: string
  displayName: string
  username: string
  avatarId: string
  xp: number
  focusMinutes: number
  streak: number
  dailyScore: number
  isFriend: boolean
  isSelf?: boolean
}

/* ----------------------------- Community --------------------------- */

export interface Comment {
  id: string
  authorId: string
  body: string
  at: string
}

export interface Post {
  id: string
  authorId: string
  category: string
  title: string
  body: string
  at: string
  likes: number
  likedByMe: boolean
  comments: Comment[]
  shares: number
}

/* ------------------------------ Settings --------------------------- */

export type ThemeMode = 'dark' | 'light'

export interface NotificationSettings {
  deadlines: boolean
  overdue: boolean
  focusReminders: boolean
  streakWarnings: boolean
  rewardUpdates: boolean
  dailyDigest: boolean
}

export interface PrivacySettings {
  showInLeaderboard: boolean
  shareFocusTime: boolean
  communityComments: boolean
}

export interface AppSettings {
  theme: ThemeMode
  reduceMotion: boolean
  compactSidebar: boolean
  notifications: NotificationSettings
  privacy: PrivacySettings
  focus: {
    defaultMinutes: number
    dndDefault: boolean
    autoLockThresholdHours: number
    autoLockEnabled: boolean
    showLockBanner: boolean
  }
  restDay: {
    weeklyEnabled: boolean
    /** 0 = Sunday */
    weeklyDay: number
    protectStreak: boolean
    recommendAfterDays: number
  }
}
