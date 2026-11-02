import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Folder, Task, TaskDraft, TaskVerification } from '../types'
import { DEFAULT_FOLDERS } from '../data/mock/tasks'
import { SEED_TASKS } from '../data/mock/tasks'
import { uid } from '../utils/id'

interface TaskState {
  tasks: Task[]
  folders: Folder[]
  create: (draft: TaskDraft) => Task
  update: (id: string, patch: Partial<Task>) => void
  remove: (id: string) => void
  setStatus: (id: string, status: Task['status']) => void
  complete: (id: string, verification: TaskVerification) => void
  reopen: (id: string) => void
  addFolder: (name: string, color: string) => Folder
  removeFolder: (id: string) => void
  reset: () => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: SEED_TASKS,
      folders: DEFAULT_FOLDERS,

      create: (draft) => {
        const nowIso = new Date().toISOString()
        const task: Task = { ...draft, id: uid('task'), createdAt: nowIso, updatedAt: nowIso }
        set((s) => ({ tasks: [task, ...s.tasks] }))
        return task
      },

      update: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
          ),
        })),

      remove: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      setStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  updatedAt: new Date().toISOString(),
                  completedAt: status === 'completed' ? new Date().toISOString() : undefined,
                }
              : t,
          ),
        })),

      complete: (id, verification) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'completed' as const,
                  completedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  verification,
                }
              : t,
          ),
        })),

      reopen: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: 'todo' as const,
                  completedAt: undefined,
                  verification: undefined,
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        })),

      addFolder: (name, color) => {
        const folder: Folder = { id: uid('folder'), name, color }
        set((s) => ({ folders: [...s.folders, folder] }))
        return folder
      },

      removeFolder: (id) => {
        if (id === 'others') return
        set((s) => ({
          folders: s.folders.filter((f) => f.id !== id),
          tasks: s.tasks.map((t) => (t.folderId === id ? { ...t, folderId: 'others' } : t)),
        }))
      },

      reset: () => set({ tasks: SEED_TASKS, folders: DEFAULT_FOLDERS }),
    }),
    { name: 'focusly_tasks', version: 1 },
  ),
)
