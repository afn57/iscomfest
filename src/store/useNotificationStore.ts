import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppNotification, NotificationKind } from '../types'
import { uid } from '../utils/id'

export interface NotificationDraft {
  kind: NotificationKind
  title: string
  body: string
  href?: string
  dedupe?: string
}

interface NotificationState {
  notifications: AppNotification[]
  push: (draft: NotificationDraft) => AppNotification
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  clear: () => void
}

const HOURS = 3_600_000

function seed(): AppNotification[] {
  const now = Date.now()
  const mk = (
    hoursAgo: number,
    kind: NotificationKind,
    title: string,
    body: string,
    read: boolean,
    href?: string,
  ): AppNotification => ({
    id: uid('ntf'),
    kind,
    title,
    body,
    at: new Date(now - hoursAgo * HOURS).toISOString(),
    read,
    href,
  })

  return [
    mk(
      1,
      'deadline',
      'Deadline hari ini',
      '"Laporan Praktikum Fisika" jatuh tempo malam pukul 22.00.',
      false,
      '/tasks',
    ),
    mk(3, 'focus', 'Sesi fokus 50 menit selesai', 'Kerja bagus — +25 XP masuk.', true, '/focus'),
    mk(6, 'streak', 'Streak 12 hari', 'Aktivitas hari ini tercatat. Pertahankan besok.', true),
    mk(
      20,
      'overdue',
      'Tugas terlambat',
      '"Esai: Etika Penggunaan AI di Kampus" sudah melewati deadline.',
      false,
      '/tasks',
    ),
    mk(30, 'system', 'Selamat datang di FOCUSLY', 'Mulai dengan satu sesi fokus hari ini.', true),
  ]
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: seed(),

      push: (draft) => {
        const list = get().notifications
        if (draft.dedupe) {
          const recent = list.find(
            (n) => n.dedupe === draft.dedupe && Date.now() - new Date(n.at).getTime() < 12 * HOURS,
          )
          if (recent) return recent
        }
        const item: AppNotification = {
          id: uid('ntf'),
          kind: draft.kind,
          title: draft.title,
          body: draft.body,
          href: draft.href,
          dedupe: draft.dedupe,
          at: new Date().toISOString(),
          read: false,
        }
        set({ notifications: [item, ...list].slice(0, 80) })
        return item
      },

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      dismiss: (id) =>
        set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      clear: () => set({ notifications: [] }),
    }),
    { name: 'focusly_notifications', version: 1 },
  ),
)

export const selectUnread = (list: AppNotification[]): number =>
  list.filter((n) => !n.read).length
