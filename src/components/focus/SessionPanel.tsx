import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BellOff,
  Crosshair,
  Lock,
  Pause,
  Play,
  ShieldCheck,
  ShieldAlert,
  Square,
  Timer,
  Unlock,
} from 'lucide-react'
import { Badge, Button, ConfirmDialog, Panel, Select } from '../common'
import { RingProgress } from '../common/RingProgress'
import { useFocusStore, selectAllApps } from '../../store/useFocusStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useTaskStore } from '../../store/useTaskStore'
import { finishFocusSession, startFocusSession } from '../../services/actions'
import { useNow } from '../../hooks/useNow'
import { msToClock } from '../../utils/date'
import { cn } from '../../utils/cn'
import { toast } from '../../store/useToastStore'

const DURATION_PRESETS = [15, 25, 45, 50, 90]

export function SessionPanel() {
  const active = useFocusStore((s) => s.active)
  const selectedAppIds = useFocusStore((s) => s.selectedAppIds)
  const customApps = useFocusStore((s) => s.customApps)
  const dndDefault = useSettingsStore((s) => s.settings.focus.dndDefault)
  const defaultMinutes = useSettingsStore((s) => s.settings.focus.defaultMinutes)
  const showBanner = useSettingsStore((s) => s.settings.focus.showLockBanner)
  const tasks = useTaskStore((s) => s.tasks)

  const [minutes, setMinutes] = useState(defaultMinutes)
  const [taskId, setTaskId] = useState<string>('')
  const [dnd, setDnd] = useState(dndDefault)
  const [ending, setEnding] = useState(false)
  const [custom, setCustom] = useState(String(defaultMinutes))

  const now = useNow(active ? 250 : 0)
  const dndActive = active ? active.dnd : dnd

  useEffect(() => {
    if (!active) setMinutes(defaultMinutes)
  }, [defaultMinutes, active])

  const openTasks = useMemo(() => tasks.filter((t) => t.status !== 'completed'), [tasks])
  const apps = useMemo(() => selectAllApps({ customApps }), [customApps])

  const plannedMs = (active?.plannedMinutes ?? minutes) * 60_000
  let elapsed = 0
  if (active) {
    const started = new Date(active.startedAt).getTime()
    const paused = active.pausedAt ? now - new Date(active.pausedAt).getTime() : 0
    elapsed = Math.max(0, now - started - active.accumulatedPauseMs - paused)
  }
  const remaining = Math.max(0, plannedMs - elapsed)
  const percent = plannedMs === 0 ? 0 : (elapsed / plannedMs) * 100
  const paused = Boolean(active?.pausedAt)

  const start = () => {
    startFocusSession({
      taskId: taskId || undefined,
      plannedMinutes: minutes,
      dnd,
      appIds: selectedAppIds,
    })
    toast.info(
      'Focus Mode aktif',
      `${minutes} menit${dnd ? ' dengan Do Not Disturb' : ''}. Selesaikan sesi untuk mendapatkan XP.`,
    )
  }

  const confirmEnd = () => {
    const session = finishFocusSession('ended_early')
    setEnding(false)
    if (session) {
      toast.info(
        'Sesi diakhiri',
        `${session.actualMinutes} menit tercatat dari ${session.plannedMinutes} menit rencana.`,
      )
    }
  }

  return (
    <div className="space-y-4">
      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={active ? 'success' : 'neutral'} dot>
          {active ? 'Focus Mode Active' : 'Focus Mode Inactive'}
        </Badge>
        <Badge tone={active && dndActive ? 'accent' : 'neutral'}>
          <BellOff className="size-3" /> DND {active ? (dndActive ? 'On' : 'Off') : dnd ? 'On (siap)' : 'Off'}
        </Badge>
        <Badge tone={selectedAppIds.length > 0 ? 'primary' : 'neutral'}>
          <Lock className="size-3" /> {selectedAppIds.length} aplikasi dibatasi
        </Badge>
        <Badge tone={active && selectedAppIds.length > 0 ? 'warning' : 'neutral'}>
          <ShieldAlert className="size-3" /> Simulated lock: {active && selectedAppIds.length > 0 ? 'ON' : 'OFF'}
        </Badge>
      </div>

      {showBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft/60 px-4 py-3">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          <p className="text-[12.5px] leading-relaxed text-warning/90">
            <strong className="font-semibold text-warning">Simulasi UI.</strong> Focus Lock di
            FOCUSLY hanya mengelola state dan tampilan di dalam aplikasi. Pemblokiran nyata
            aplikasi/website lain membutuhkan browser extension atau native application — struktur
            kode disiapkan agar bisa diintegrasikan pada tahap berikutnya.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Timer */}
        <Panel className="items-stretch" padding="lg">
          <div className="flex flex-col items-center">
            <RingProgress
              percent={percent}
              size={260}
              stroke={14}
              color={active ? (paused ? 'var(--warning)' : 'var(--primary)') : 'var(--surface-3)'}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                {active ? (paused ? 'Paused' : 'Fokus') : 'Siap'}
              </span>
              <span className="mt-1 font-display text-5xl font-bold tabular-nums text-ink">
                {msToClock(remaining)}
              </span>
              <span className="mt-1 text-[12px] text-ink-muted">
                {active
                  ? `${active.plannedMinutes} menit rencana`
                  : `${minutes} menit dipilih`}
              </span>
            </RingProgress>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {!active ? (
                <Button size="lg" icon={<Play />} onClick={start}>
                  Start Focus Session
                </Button>
              ) : (
                <>
                  {!paused ? (
                    <Button size="lg" variant="secondary" icon={<Pause />} onClick={() => useFocusStore.getState().pause()}>
                      Pause
                    </Button>
                  ) : (
                    <Button size="lg" icon={<Play />} onClick={() => useFocusStore.getState().resume()}>
                      Resume
                    </Button>
                  )}
                  <Button size="lg" variant="danger" icon={<Square />} onClick={() => setEnding(true)}>
                    End Session
                  </Button>
                </>
              )}
            </div>

            {active && (
              <p className="mt-4 text-center text-[12.5px] text-ink-muted">
                {paused
                  ? 'Timer dijeda — waktu istirahat tidak dihitung.'
                  : 'Sesi akan otomatis selesai saat waktu habis dan XP langsung diberikan.'}
              </p>
            )}
          </div>
        </Panel>

        {/* Configuration */}
        <div className="space-y-4">
          <Panel title="Pengaturan sesi" description="Atur durasi, tugas, dan mode gangguan.">
            <div className="space-y-4">
              <div>
                <span className="mb-2 block text-[13px] font-medium text-ink-soft">Durasi fokus</span>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      disabled={Boolean(active)}
                      onClick={() => {
                        setMinutes(d)
                        setCustom(String(d))
                      }}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-colors disabled:opacity-50',
                        minutes === d && !active
                          ? 'border-primary/50 bg-primary-soft text-primary'
                          : 'border-line bg-surface-2 text-ink-muted hover:border-line-strong hover:text-ink',
                      )}
                    >
                      {d}m
                    </button>
                  ))}
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    disabled={Boolean(active)}
                    value={custom}
                    onChange={(e) => {
                      setCustom(e.target.value)
                      const v = Number(e.target.value)
                      if (Number.isFinite(v) && v >= 5 && v <= 240) setMinutes(v)
                    }}
                    aria-label="Durasi custom (menit)"
                    className="h-8 w-20 rounded-lg border border-line bg-surface-2 px-2.5 text-[12.5px] tabular-nums text-ink focus:border-primary focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <span className="mb-2 block text-[13px] font-medium text-ink-soft">
                  Tugas yang dikerjakan
                </span>
                <Select
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  disabled={Boolean(active)}
                >
                  <option value="">Tanpa tugas spesifik</option>
                  {openTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2 px-3.5 py-3">
                <div>
                  <div className="text-[13px] font-medium text-ink">Do Not Disturb</div>
                  <div className="mt-0.5 text-[11.5px] text-ink-muted">
                    Wajib aktif agar sesi dihitung ke streak.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={dnd}
                  onClick={() => setDnd((v) => !v)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
                    dnd ? 'bg-primary border-primary' : 'bg-surface-3 border-line-strong',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block size-4.5 transform rounded-full bg-white shadow transition-transform',
                      dnd ? 'translate-x-5.5' : 'translate-x-1',
                    )}
                  />
                </button>
              </div>

              <p className="text-[12px] leading-relaxed text-ink-muted">
                <span className="inline-flex items-center gap-1 font-medium text-ink-soft">
                  <Timer className="size-3.5" /> Estimasi: {minutes} menit ·{' '}
                  {selectedAppIds.length} aplikasi dibatasi
                </span>
              </p>
            </div>
          </Panel>

          <LockStatusCard active={Boolean(active)} appCount={selectedAppIds.length} apps={apps.length} />
        </div>
      </div>

      <ConfirmDialog
        open={ending}
        onClose={() => setEnding(false)}
        onConfirm={confirmEnd}
        title="Akhiri sesi fokus?"
        tone="danger"
        confirmLabel="Akhiri sesi"
        body={
          <>
            Sesi yang diakhiri sebelum waktu habis tetap tercatat, tetapi kamu hanya mendapat
            poin sebagian. Streak hari ini butuh sesi yang{' '}
            <strong className="text-ink">selesai penuh</strong> dengan DND aktif.
          </>
        }
      />
    </div>
  )
}

function LockStatusCard({ active, appCount, apps }: { active: boolean; appCount: number; apps: number }) {
  const simulated = active && appCount > 0
  return (
    <Panel title="Lock status">
      <ul className="space-y-2.5 text-[12.5px]">
        <StatusRow
          icon={active ? <Crosshair className="size-3.5" /> : <Crosshair className="size-3.5" />}
          label="Focus Mode"
          value={active ? 'Active' : 'Inactive'}
          tone={active ? 'success' : 'neutral'}
        />
        <StatusRow
          icon={<Unlock className="size-3.5" />}
          label="Restricted apps selected"
          value={`${appCount} dari ${apps}`}
          tone={appCount > 0 ? 'primary' : 'neutral'}
        />
        <StatusRow
          icon={simulated ? <ShieldCheck className="size-3.5" /> : <ShieldAlert className="size-3.5" />}
          label="Simulated lock"
          value={simulated ? 'ON (simulasi)' : 'OFF'}
          tone={simulated ? 'warning' : 'neutral'}
        />
      </ul>
      <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-muted">
        Status di atas adalah indikator state aplikasi, bukan bukti pemblokiran sistem operasi.
      </p>
    </Panel>
  )
}

function StatusRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: 'success' | 'primary' | 'warning' | 'neutral'
}) {
  const tones = {
    success: 'text-success bg-success-soft',
    primary: 'text-primary bg-primary-soft',
    warning: 'text-warning bg-warning-soft',
    neutral: 'text-ink-muted bg-surface-3',
  }
  return (
    <li className="flex items-center gap-2.5">
      <span className={cn('flex size-7 items-center justify-center rounded-lg', tones[tone])}>
        {icon}
      </span>
      <span className="text-ink-muted">{label}</span>
      <span className="ml-auto font-medium text-ink-soft tabular-nums">{value}</span>
    </li>
  )
}
