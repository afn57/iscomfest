import { Gift, History, Trash2 } from 'lucide-react'
import { useRewardStore } from '../../store/useRewardStore'
import { rewardById } from '../../services/actions'
import { relativeFromNow } from '../../utils/date'
import { Button, ConfirmDialog, EmptyState, IconByName, Panel } from '../common'
import { useState } from 'react'

export function RedemptionHistory() {
  const redemptions = useRewardStore((s) => s.redemptions)
  const clearHistory = useRewardStore((s) => s.clearHistory)
  const [confirm, setConfirm] = useState(false)

  return (
    <>
      <Panel
        title="Riwayat penukaran"
        description={`${redemptions.length} reward pernah diklaim.`}
        action={
          redemptions.length > 0 ? (
            <Button size="sm" variant="ghost" icon={<Trash2 />} onClick={() => setConfirm(true)}>
              Bersihkan
            </Button>
          ) : null
        }
        padding="none"
      >
        {redemptions.length === 0 ? (
          <div className="px-5 pb-5">
            <EmptyState
              compact
              icon={<Gift />}
              title="Belum ada penukaran"
              description="Kumpulkan coins dari sesi fokus dan tugas, lalu tukarkan di katalog."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {redemptions.map((r) => {
              const meta = rewardById(r.rewardId)
              return (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <IconByName name={meta?.icon ?? 'Gift'} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-ink">{r.rewardName}</p>
                    <p className="text-[12px] text-ink-muted">
                      <History className="mr-1 inline size-3" />
                      {relativeFromNow(r.redeemedAt)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-warning-soft px-2.5 py-1 text-[12px] font-medium tabular-nums text-warning">
                    -{r.cost}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          clearHistory()
          setConfirm(false)
        }}
        title="Bersihkan riwayat penukaran?"
        tone="danger"
        confirmLabel="Bersihkan"
        body="Riwayat akan dihapus dari perangkat ini. Coins yang sudah dibelanjakan tidak dikembalikan."
      />
    </>
  )
}
