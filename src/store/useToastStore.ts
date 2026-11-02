import { create } from 'zustand'

export type ToastKind = 'success' | 'error' | 'info' | 'xp' | 'level'

export interface Toast {
  id: string
  kind: ToastKind
  title: string
  description?: string
  xp?: number
  level?: number
}

interface ToastState {
  toasts: Toast[]
  push: (toast: Omit<Toast, 'id'>) => string
  dismiss: (id: string) => void
}

let seq = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push: (toast) => {
    seq += 1
    const id = `toast_${seq}`
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }].slice(-4) }))
    return id
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'success', title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'error', title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'info', title, description }),
  xp: (amount: number, title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'xp', title, description, xp: amount }),
  level: (level: number, title: string, description?: string) =>
    useToastStore.getState().push({ kind: 'level', title, description, level }),
}
