import { useEffect } from 'react'
import { CheckCircle2, Info, Trophy, X, XCircle, Zap } from 'lucide-react'
import { useToastStore, type Toast } from '../../store/useToastStore'
import { cn } from '../../utils/cn'

const KIND_STYLE: Record<Toast['kind'], { ring: string; icon: typeof Info }> = {
  success: { ring: 'border-success/40', icon: CheckCircle2 },
  error: { ring: 'border-danger/40', icon: XCircle },
  info: { ring: 'border-line-strong', icon: Info },
  xp: { ring: 'border-primary/50', icon: Zap },
  level: { ring: 'border-warning/50', icon: Trophy },
}

const ICON_COLOR: Record<Toast['kind'], string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-ink-muted',
  xp: 'text-primary',
  level: 'text-warning',
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss)
  const style = KIND_STYLE[toast.kind]
  const Icon = style.icon

  useEffect(() => {
    const ms = toast.kind === 'level' ? 6000 : 4200
    const id = window.setTimeout(() => dismiss(toast.id), ms)
    return () => window.clearTimeout(id)
  }, [toast.id, toast.kind, dismiss])

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border bg-surface p-3.5 shadow-pop animate-pop',
        style.ring,
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-2',
          ICON_COLOR[toast.kind],
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-semibold text-ink leading-snug">{toast.title}</p>
          {toast.xp !== undefined && (
            <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary animate-pop">
              +{toast.xp} XP
            </span>
          )}
          {toast.level !== undefined && (
            <span className="shrink-0 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-bold text-warning animate-pop">
              LEVEL {toast.level}
            </span>
          )}
        </div>
        {toast.description && (
          <p className="mt-0.5 text-[12.5px] text-ink-muted leading-snug">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Tutup notifikasi"
        className="shrink-0 rounded p-1 text-ink-muted transition-colors hover:text-ink"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
