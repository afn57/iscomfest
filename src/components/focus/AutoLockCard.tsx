import { useMemo } from 'react'
import { CalendarClock, Play, ShieldCheck, Zap } from 'lucide-react'
import { Badge, Button, Panel } from '../common'
import { autoLockCandidate } from '../../services/reminders'
import { useFocusStore } from '../../store/useFocusStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { startFocusSession } from '../../services/actions'
import { useTaskStore } from '../../store/useTaskStore'
import { toast } from '../../store/useToastStore'
import { deadlineLabel } from '../../utils/date'

export function AutoLockCard() {
  const active = useFocusStore((s) => s.active)
  const selectedAppIds = useFocusStore((s) => s.selectedAppIds)
  const dnd = useFocusStore((s) => s.dndEnabled)
  const threshold = useSettingsStore((s) => s.settings.focus.autoLockThresholdHours)
  const enabled = useSettingsStore((s) => s.settings.focus.autoLockEnabled)
  const updateSection = useSettingsStore((s) => s.updateSection)
  const tasks = useTaskStore((s) => s.tasks)

  const candidate = useMemo(
    () => autoLockCandidate(tasks, enabled, threshold),
    [tasks, enabled, threshold],
  )

  if (!enabled) {
    return (
      <Panel title="Automatic Focus Lock">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-3">
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            Rekomendasi penguncian otomatis sedang nonaktif. Nyalakan agar FOCUSLY mengingatkan
            saat deadline mendekat.
          </p>
          <Button size="sm" variant="secondary" onClick={() => updateSection('focus', { autoLockEnabled: true })}>
            Nyalakan
          </Button>
        </div>
      </Panel>
    )
  }

  return (
    <Panel
      title="Automatic Focus Lock"
      description={`Rekomendasi aktif ketika deadline kurang dari ${threshold} jam dan tugas belum selesai.`}
      action={<Badge tone={active ? 'success' : 'warning'} dot>{active ? 'Sesi aktif' : 'Menunggu'}</Badge>}
    >
      {candidate ? (
        <div className="rounded-xl border border-warning/35 bg-warning-soft/50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning">
              <Zap className="size-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-snug text-ink">{candidate.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-muted">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="size-3" /> {deadlineLabel(candidate.deadline, candidate.status)}
                </span>
                <span>{candidate.category}</span>
                <span>{Math.round(candidate.estimateMinutes)} menit estimasi</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  icon={<Play />}
                  disabled={Boolean(active)}
                  onClick={() => {
                    startFocusSession({
                      taskId: candidate.id,
                      plannedMinutes: Math.min(50, Math.max(15, Math.round(candidate.estimateMinutes / 2))),
                      dnd: true,
                      appIds: selectedAppIds,
                    })
                    toast.success(
                      'Focus Lock otomatis diaktifkan',
                      `"${candidate.title}" dikunci dengan DND aktif.`,
                    )
                  }}
                >
                  {active ? 'Sesi sedang berjalan' : 'Aktifkan Focus Lock'}
                </Button>
                <span className="text-[11.5px] text-ink-muted">
                  DND {dnd ? 'mengikuti pengaturan' : 'nonaktif'} · {selectedAppIds.length} aplikasi
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3.5">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-success-soft text-success">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink">Tidak ada deadline mendesak</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-muted">
              Semua tugas masih di luar ambang {threshold} jam. Rekomendasi penguncian otomatis
              akan muncul di sini begitu mendekat.
            </p>
          </div>
        </div>
      )}
    </Panel>
  )
}
