import { selectAllApps, useFocusStore } from '../../store/useFocusStore'
import { useLockStore } from '../../store/useLockStore'
import { normalizeHost } from '../../utils/host'
import type { ExtToPageMessage, PageToExtMessage } from './types'

const APP_SOURCE = 'focusly-app'
const EXT_SOURCE = 'focusly-ext'

let initialized = false
let lastSignature = ''

function post(message: PageToExtMessage): void {
  window.postMessage({ source: APP_SOURCE, ...message }, '*')
}

function send(message: PageToExtMessage, signature: string): void {
  if (signature === lastSignature) return
  lastSignature = signature
  post(message)
}

/**
 * Sinkronkan state Focus Lock di store dengan FOCUSLY Extension.
 * Dipanggil setiap perubahan store (start/pause/resume/end/reset/pilih app).
 */
export function syncFocusLock(): void {
  const { active, selectedAppIds, customApps } = useFocusStore.getState()
  const { extensionPresent } = useLockStore.getState()
  if (!extensionPresent) return

  if (!active || selectedAppIds.length === 0) {
    send({ type: 'unlock' }, 'unlock')
    return
  }

  const hosts = selectAllApps({ customApps })
    .filter((app) => selectedAppIds.includes(app.id))
    .map((app) => normalizeHost(app.host))
    .filter((host) => host.includes('.'))

  if (hosts.length === 0) {
    send({ type: 'unlock' }, 'unlock')
    return
  }

  const started = new Date(active.startedAt).getTime()
  const pausedExtra = active.pausedAt ? Date.now() - new Date(active.pausedAt).getTime() : 0
  const expiresAt =
    Math.ceil((started + active.plannedMinutes * 60_000 + active.accumulatedPauseMs + pausedExtra) / 1000) * 1000

  send(
    { type: 'lock', hosts, expiresAt, appOrigin: window.location.origin },
    `lock:${expiresAt}:${hosts.join('|')}`,
  )
}

function handleExtMessage(event: MessageEvent): void {
  if (event.source !== window) return
  const message = event.data as (ExtToPageMessage & { source?: string }) | null
  if (!message || message.source !== EXT_SOURCE) return

  const lock = useLockStore.getState()

  if (message.type === 'ready') {
    lock.setExtensionPresent(true)
    lastSignature = ''
    post({ type: 'status' })
    syncFocusLock()
    return
  }

  if (message.type !== 'ack') return

  if (message.for === 'status' && !message.ok) {
    lock.setExtensionPresent(false)
    lock.setLockEngaged(false)
    return
  }

  lock.setExtensionPresent(true)
  if (message.for === 'lock') lock.setLockEngaged(Boolean(message.ok))
  else if (message.for === 'unlock') lock.setLockEngaged(false)
  else if (message.for === 'status') lock.setLockEngaged(Boolean(message.status?.engaged))
}

/**
 * Inisialisasi jembatan ke FOCUSLY Extension (sekali per halaman).
 * Tanpa extension, semua panggilan jadi no-op dan status tetap "simulasi".
 */
export function initBlocking(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('message', handleExtMessage)
  useFocusStore.subscribe(() => syncFocusLock())

  post({ type: 'hello' })
  syncFocusLock()
}
