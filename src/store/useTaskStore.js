import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_FOLDERS } from '../data/mock/tasks';
import { SEED_TASKS } from '../data/mock/tasks';
import { uid } from '../utils/id';
export const useTaskStore = create()(persist((set) => ({
    tasks: SEED_TASKS,
    folders: DEFAULT_FOLDERS,
    create: (draft) => {
        const nowIso = new Date().toISOString();
        const task = { ...draft, id: uid('task'), createdAt: nowIso, updatedAt: nowIso };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return task;
    },
    update: (id, patch) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t),
    })),
    remove: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    setStatus: (id, status) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id
            ? {
                ...t,
                status,
                updatedAt: new Date().toISOString(),
                completedAt: status === 'completed' ? new Date().toISOString() : undefined,
            }
            : t),
    })),
    complete: (id, verification) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id
            ? {
                ...t,
                status: 'completed',
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                verification,
            }
            : t),
    })),
    reopen: (id) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id
            ? {
                ...t,
                status: 'todo',
                completedAt: undefined,
                verification: undefined,
                updatedAt: new Date().toISOString(),
            }
            : t),
    })),
    addFolder: (name, color) => {
        const folder = { id: uid('folder'), name, color };
        set((s) => ({ folders: [...s.folders, folder] }));
        return folder;
    },
    removeFolder: (id) => {
        if (id === 'others')
            return;
        set((s) => ({
            folders: s.folders.filter((f) => f.id !== id),
            tasks: s.tasks.map((t) => (t.folderId === id ? { ...t, folderId: 'others' } : t)),
        }));
    },
    reset: () => set({ tasks: SEED_TASKS, folders: DEFAULT_FOLDERS }),
}), { name: 'focusly_tasks', version: 1 }));
