export interface LockStatus {
  engaged: boolean
  hosts?: string[]
  expiresAt?: number
  appOrigin?: string
}

export type ExtAck = {
  type: 'ack'
  for: 'lock' | 'unlock' | 'status'
  ok: boolean
  status?: LockStatus
}

export type ExtToPageMessage = { type: 'ready' } | ExtAck

export type PageToExtMessage =
  | { type: 'hello' }
  | { type: 'lock'; hosts: string[]; expiresAt: number; appOrigin: string }
  | { type: 'unlock' }
  | { type: 'status' }
