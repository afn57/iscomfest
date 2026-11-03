import { create } from 'zustand'

interface LockState {
  /** FOCUSLY Extension terdeteksi terpasang di browser. */
  extensionPresent: boolean
  /** Extension mengonfirmasi blokir sedang diterapkan. */
  lockEngaged: boolean
  setExtensionPresent: (value: boolean) => void
  setLockEngaged: (value: boolean) => void
}

export const useLockStore = create<LockState>((set) => ({
  extensionPresent: false,
  lockEngaged: false,
  setExtensionPresent: (extensionPresent) => set({ extensionPresent }),
  setLockEngaged: (lockEngaged) => set({ lockEngaged }),
}))
