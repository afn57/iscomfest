import { useRef, useState } from 'react'
import { Database, Download, RotateCcw, Upload } from 'lucide-react'
import { ConfirmDialog, Panel } from '../common'
import { toast } from '../../store/useToastStore'

const STORAGE_PREFIX = 'focusly_'

function storageKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (key && key.startsWith(STORAGE_PREFIX)) keys.push(key)
  }
  return keys.sort()
}

function snapshot(): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of storageKeys()) {
    try {
      out[key] = JSON.parse(window.localStorage.getItem(key) ?? 'null')
    } catch {
      out[key] = null
    }
  }
  return out
}

export function DataSettings() {
  const [confirmReset, setConfirmReset] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const data = JSON.stringify(snapshot(), null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `focusly-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup diunduh', `${storageKeys().length} bagian data disimpan ke file JSON.`)
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Record<string, unknown>
        let applied = 0
        for (const [key, value] of Object.entries(parsed)) {
          if (!key.startsWith(STORAGE_PREFIX)) continue
          window.localStorage.setItem(key, JSON.stringify(value))
          applied++
        }
        if (applied === 0) {
          toast.error('Tidak ada data valid', 'File tidak berisi cadangan FOCUSLY.')
          return
        }
        toast.success('Backup dipulihkan', `${applied} bagian data dimuat. Muat ulang...`)
        window.setTimeout(() => window.location.reload(), 700)
      } catch {
        toast.error('File tidak valid', 'Pastikan file JSON berasal dari ekspor FOCUSLY.')
      }
    }
    reader.readAsText(file)
  }

  const resetAll = () => {
    storageKeys().forEach((k) => window.localStorage.removeItem(k))
    setConfirmReset(false)
    toast.info('Data direset', 'Semua data dikembalikan ke kondisi awal.')
    window.setTimeout(() => window.location.reload(), 600)
  }

  const keys = storageKeys()

  return (
    <>
      <Panel
        title="Data & penyimpanan"
        description={`${keys.length} entri tersimpan di localStorage browser.`}
        action={<Database className="size-4 text-ink-muted" />}
      >
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={exportData}
            className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-left transition-colors hover:border-primary/50"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Download className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-ink">Ekspor cadangan</span>
              <span className="block text-[12px] text-ink-muted">
                Unduh seluruh data sebagai file JSON.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3 text-left transition-colors hover:border-primary/50"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Upload className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-ink">Pulihkan cadangan</span>
              <span className="block text-[12px] text-ink-muted">
                Muat data dari file JSON hasil ekspor.
              </span>
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) importData(file)
              e.target.value = ''
            }}
          />

          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-left transition-colors hover:border-danger"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-danger/20 text-danger">
              <RotateCcw className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium text-ink">Reset seluruh data</span>
              <span className="block text-[12px] text-ink-muted">
                Hapus progres, tugas, dan kustomisasi kembali ke kondisi awal.
              </span>
            </span>
          </button>
        </div>

        <p className="mt-4 text-[12.5px] leading-relaxed text-ink-muted">
          Kunci tersimpan: <span className="text-ink-soft">{keys.join(', ') || '(kosong)'}</span>
        </p>
      </Panel>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={resetAll}
        title="Reset seluruh data FOCUSLY?"
        tone="danger"
        confirmLabel="Reset sekarang"
        body="Streak, XP, tugas, postingan, dan kustomisasi profil akan dihapus permanen di perangkat ini. Sebaiknya ekspor cadangan terlebih dahulu."
      />
    </>
  )
}
