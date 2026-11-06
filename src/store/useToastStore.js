import { create } from 'zustand';
let seq = 0;
export const useToastStore = create((set) => ({
    toasts: [],
    push: (toast) => {
        seq += 1;
        const id = `toast_${seq}`;
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }].slice(-4) }));
        return id;
    },
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
export const toast = {
    success: (title, description) => useToastStore.getState().push({ kind: 'success', title, description }),
    error: (title, description) => useToastStore.getState().push({ kind: 'error', title, description }),
    info: (title, description) => useToastStore.getState().push({ kind: 'info', title, description }),
    xp: (amount, title, description) => useToastStore.getState().push({ kind: 'xp', title, description, xp: amount }),
    level: (level, title, description) => useToastStore.getState().push({ kind: 'level', title, description, level }),
};
