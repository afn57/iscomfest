import { useEffect, useRef, useState } from 'react'
import { FileText, StickyNote, Upload, UserCheck } from 'lucide-react'
import { Button, Field, Modal, Textarea } from '../common'
import { completeTaskWithVerification } from '../../services/actions'
import type { Task, VerificationMethod } from '../../types'
import { formatBytes } from '../../utils/format'
import { cn } from '../../utils/cn'

const METHODS: Array<{
  id: VerificationMethod
  label: string
  description: string
  icon: typeof UserCheck
}> = [
  {
    id: 'self',
    label: 'Self Confirmation',
    description: 'Saya menyatakan tugas ini sudah saya kerjakan sebagaimana mestinya.',
    icon: UserCheck,
  },
  {
    id: 'evidence',
    label: 'Upload Evidence (simulasi)',
    description: 'Lampirkan bukti pengerjaan. File hanya dibaca secara lokal, tidak diunggah.',
    icon: Upload,
  },
  {
    id: 'note',
    label: 'Catatan penyelesaian',
    description: 'Tuliskan ringkasan hasil kerja sebagai jejak refleksi.',
    icon: StickyNote,
  },
]

interface CompletionDialogProps {
  task: Task | null
  open: boolean
  onClose: () => void
}

export function CompletionDialog({ task, open, onClose }: CompletionDialogProps) {
  const [method, setMethod] = useState<VerificationMethod>('self')
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setMethod('self')
      setNote('')
      setFile(null)
      setSaving(false)
    }
  }, [open, task?.id])

  if (!task) return null

  const canSubmit =
    (method === 'self') ||
    (method === 'note' && note.trim().length >= 3) ||
    (method === 'evidence' && file !== null)

  const submit = () => {
    if (!canSubmit) return
    setSaving(true)
    // Small delay so the confirmation visibly processes instead of feeling instant.
    window.setTimeout(() => {
      completeTaskWithVerification(task, {
        method,
        note: method === 'note' ? note.trim() : undefined,
        evidenceName: method === 'evidence' && file ? file.name : undefined,
        evidenceSize: method === 'evidence' && file ? file.size : undefined,
      })
      setSaving(false)
      onClose()
    }, 420)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tandai tugas selesai?"
      description="FOCUSLY meminta konfirmasi penyelesaian berbasis pengguna — bukan verifikasi otomatis."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button variant="primary" onClick={submit} loading={saving} disabled={!canSubmit}>
            Tandai Completed
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-line bg-surface-2 p-3.5">
        <p className="text-[13.5px] font-semibold text-ink">{task.title}</p>
        <p className="mt-1 line-clamp-2 text-[12.5px] text-ink-muted">{task.description}</p>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[13px] font-medium text-ink-soft">Pilih metode verifikasi</p>
        {METHODS.map((m) => {
          const active = method === m.id
          const Icon = m.icon
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                active
                  ? 'border-primary/50 bg-primary-soft'
                  : 'border-line bg-surface-2 hover:border-line-strong',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                  active ? 'bg-primary text-white' : 'bg-surface-3 text-ink-muted',
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-ink">{m.label}</span>
                <span className="mt-0.5 block text-[12px] text-ink-muted leading-snug">
                  {m.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {method === 'evidence' && (
        <div className="mt-4">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface-2 p-4 text-left transition-colors hover:border-primary/50"
          >
            <Upload className="size-5 shrink-0 text-ink-muted" />
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-ink">
                {file ? file.name : 'Pilih file bukti'}
              </span>
              <span className="mt-0.5 block text-[12px] text-ink-muted">
                {file
                  ? `${formatBytes(file.size)} · siap dilampirkan (simulasi)`
                  : 'PNG, JPG, PDF, atau dokumen apa pun'}
              </span>
            </span>
          </button>
        </div>
      )}

      {method === 'note' && (
        <div className="mt-4">
          <Field label="Catatan penyelesaian" required hint="Minimal 3 karakter.">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Analisis data selesai, grafik sudah dibuat, laporan dijilid."
              maxLength={400}
            />
          </Field>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft/60 px-3 py-2.5 text-[12px] leading-relaxed text-warning">
        <FileText className="mt-px size-3.5 shrink-0" />
        FOCUSLY tidak memverifikasi kebenaran pekerjaan secara otomatis. Status Completed murni
        berdasarkan konfirmasi kamu sendiri.
      </p>
    </Modal>
  )
}
