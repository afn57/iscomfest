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
        tasks: s.tasks.map((t) => {
            if (t.id !== id)
                return t;
            const next = { ...t, ...patch, updatedAt: new Date().toISOString() };
            if (patch.status && patch.status !== 'completed' && t.status === 'completed') {
                next.completedAt = undefined;
            }
            return next;
        }),
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
    complete: (id) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id
            ? {
                ...t,
                status: 'completed',
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            : t),
    })),
    reopen: (id) => set((s) => ({
        tasks: s.tasks.map((t) => t.id === id
            ? {
                ...t,
                status: 'todo',
                completedAt: undefined,
                updatedAt: new Date().toISOString(),
            }
            : t),
    })),
    addFolder: (name, color) => {
        const folder = { id: uid('folder'), name, color };
        set((s) => ({ folders: [...s.folders, folder] }));
        return folder;
    },
    renameFolder: (id, name) => set((s) => ({
        folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
    })),
    removeFolder: (id) => {
        if (id === 'others')
            return;
        set((s) => ({
            folders: s.folders.filter((f) => f.id !== id),
            tasks: s.tasks.map((t) => (t.folderId === id ? { ...t, folderId: 'others' } : t)),
        }));
    },
    reset: () => set({ tasks: SEED_TASKS, folders: DEFAULT_FOLDERS }),
}), { name: 'flowstate_tasks', version: 1 }));
