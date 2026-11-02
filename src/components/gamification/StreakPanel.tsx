import { Flame, Info, ShieldCheck } from 'lucide-react'
import { useProgressStore } from '../../store/useProgressStore'
import { streakWeek } from '../../services/selectors'
import { cn } from '../../utils/cn'
import { Panel } from '../common'

export function StreakPanel() {
  const progress = useProgressStore((s) => s.progress)
  const week = streakWeek()

  return (
    <Panel
      title="Streak aktif"
      description="Streak bertambah hanya lewat aktivitas selesai — bukan sekadar membuka aplikasi."
    >
      <div className="flex items-end gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <Flame className="size-5" />
            </span>
            <span className="font-display text-4xl font-bold tabular-nums text-ink">
              {progress.currentStreak}
            </span>
            <span className="pb-1 text-[13px] text-ink-muted">hari</span>
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-muted">
            Rekor terpanjang: <span className="font-medium text-ink-soft">{progress.longestStreak} hari</span>
          </p>
        </div>

        <div className="flex gap-1.5 pb-1">
          {week.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-1.5">
              <span
                title={
                  d.rest
                    ? 'Rest Day — streak dipertahankan'
                    : d.active
                      ? 'Aktif'
                      : 'Tidak ada aktivitas'
                }
                className={cn(
                  'size-7 rounded-lg border transition-colors',
                  d.rest
                    ? 'border-accent/50 bg-accent-soft'
                    : d.active
                      ? 'border-success/50 bg-success-soft'
                      : 'border-line bg-surface-2',
                  d.isToday && 'ring-2 ring-primary/60',
                )}
              />
              <span className="text-[10.5px] text-ink-muted">
                {d.date.toLocaleDateString('id-ID', { weekday: 'narrow' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Legend color="bg-success-soft border-success/50" label="Aktif" hint="tugas/fokus selesai" />
        <Legend color="bg-accent-soft border-accent/50" label="Rest Day" hint="netral, streak aman" />
        <Legend color="bg-surface-2 border-line" label="Kosong" hint="streak berisiko putus" />
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          Rest Day dijadwalkan lewat fitur ini bersifat <span className="text-ink-soft">netral</span>:
          tidak menambah maupun mengurangi angka. Hari tanpa aktivitas dan tanpa Rest Day akan
          mereset streak ke nol.
        </p>
      </div>

      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-success/30 bg-success-soft px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          Proteksi streak aktif — hari istirahat terjadwal akan menjembatani jarak antar hari aktif.
        </p>
      </div>
    </Panel>
  )
}

function Legend({ color, label, hint }: { color: string; label: string; hint: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
      <span className={cn('size-4 shrink-0 rounded border', color)} />
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium text-ink-soft">{label}</span>
        <span className="block truncate text-[11.5px] text-ink-muted">{hint}</span>
      </span>
    </div>
  )
}
