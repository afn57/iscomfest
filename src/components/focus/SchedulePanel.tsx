import { useState } from 'react'
import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge, Button, EmptyState, Field, Input, Modal, Panel } from '../common'
import { useFocusStore } from '../../store/useFocusStore'
import type { FocusSchedule } from '../../types'
import { minuteOfDayToClock } from '../../utils/date'
import { cn } from '../../utils/cn'
import { toast } from '../../store/useToastStore'

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const DEFAULT_DAYS = [1, 2, 3, 4, 5]

export function SchedulePanel() {
  const schedules = useFocusStore((s) => s.schedules)
  const addSchedule = useFocusStore((s) => s.addSchedule)
  const updateSchedule = useFocusStore((s) => s.updateSchedule)
  const removeSchedule = useFocusStore((s) => s.removeSchedule)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FocusSchedule | null>(null)
  const [label, setLabel] = useState('')
  const [start, setStart] = useState('07:00')
  const [duration, setDuration] = useState(50)
  const [days, setDays] = useState<number[]>(DEFAULT_DAYS)
  const [error, setError] = useState('')

  const openNew = () => {
    setEditing(null)
    setLabel('')
    setStart('07:00')
    setDuration(50)
    setDays(DEFAULT_DAYS)
    setError('')
    setOpen(true)
  }

  const openEdit = (s: FocusSchedule) => {
    setEditing(s)
    setLabel(s.label)
    setStart(minuteOfDayToClock(s.startMinute))
    setDuration(s.durationMinutes)
    setDays([...s.days])
    setError('')
    setOpen(true)
  }

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()))

  const save = () => {
    if (label.trim().length < 3) {
      setError('Nama jadwal minimal 3 karakter.')
      return
    }
    if (days.length === 0) {
      setError('Pilih minimal satu hari.')
      return
    }
    if (duration < 5 || duration > 240) {
      setError('Durasi antara 5 dan 240 menit.')
      return
    }
    const [h, m] = start.split(':').map(Number)
    const payload = {
      label: label.trim(),
      startMinute: (h || 0) * 60 + (m || 0),
      durationMinutes: duration,
      days,
      enabled: editing ? editing.enabled : true,
    }

    if (editing) updateSchedule(editing.id, payload)
    else addSchedule(payload)

    toast.success(editing ? 'Jadwal diperbarui' : 'Jadwal ditambahkan', payload.label)
    setOpen(false)
  }

  return (
    <>
      <Panel
        title="Jadwal Focus Mode"
        description="Pengingat muncul 30 menit sebelum jadwal dimulai (jika notifikasi fokus aktif)."
        action={
          <Button size="sm" icon={<Plus />} onClick={openNew}>
            Tambah jadwal
          </Button>
        }
      >
        {schedules.length === 0 ? (
          <EmptyState
            compact
            icon={<CalendarClock />}
            title="Belum ada jadwal"
            description="Buat rutinitas fokus agar kebiasaanmu terjadwal."
            action={
              <Button size="sm" onClick={openNew}>
                Buat jadwal
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2.5">
            {schedules.map((s) => (
              <li
                key={s.id}
                className={cn(
                  'group flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                  s.enabled ? 'border-line bg-surface-2' : 'border-line bg-surface-2 opacity-60',
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <CalendarClock className="size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-medium text-ink">{s.label}</span>
                    <Badge tone="primary">
                      {minuteOfDayToClock(s.startMinute)} · {s.durationMinutes}m
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {DAY_LABELS.map((d, i) => (
                      <span
                        key={d}
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10.5px] font-medium',
                          s.days.includes(i)
                            ? 'bg-primary-soft text-primary'
                            : 'bg-surface-3 text-ink-muted',
                        )}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={s.enabled}
                    aria-label={`Aktifkan ${s.label}`}
                    onClick={() => updateSchedule(s.id, { enabled: !s.enabled })}
                    className={cn(
                      'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors',
                      s.enabled ? 'bg-primary border-primary' : 'bg-surface-3 border-line-strong',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block size-3.5 transform rounded-full bg-white transition-transform',
                        s.enabled ? 'translate-x-4.5' : 'translate-x-1',
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(s)}
                    aria-label="Edit jadwal"
                    className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removeSchedule(s.id)
                      toast.info('Jadwal dihapus', s.label)
                    }}
                    aria-label="Hapus jadwal"
                    className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit jadwal' : 'Jadwal baru'}
        description="Tentukan kapan Focus Mode sebaiknya dimulai secara rutin."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>{editing ? 'Simpan' : 'Tambahkan'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nama jadwal" required error={error && label.trim().length < 3 ? error : undefined}>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Contoh: Belajar pagi"
              maxLength={40}
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Mulai">
              <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </Field>
            <Field label="Durasi (menit)">
              <Input
                type="number"
                min={5}
                max={240}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </Field>
          </div>

          <div>
            <span className="mb-2 block text-[13px] font-medium text-ink-soft">Hari</span>
            <div className="flex flex-wrap gap-1.5">
              {DAY_LABELS.map((d, i) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(i)}
                  aria-pressed={days.includes(i)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                    days.includes(i)
                      ? 'border-primary/50 bg-primary-soft text-primary'
                      : 'border-line bg-surface-2 text-ink-muted hover:border-line-strong',
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-[12px] text-danger">{error}</p>}
        </div>
      </Modal>
    </>
  )
}
