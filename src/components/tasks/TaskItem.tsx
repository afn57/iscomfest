import { useState } from 'react'
import { Check, Clock, Crosshair, Flag, Pencil, Trash2 } from 'lucide-react'
import { Badge, Select } from '../common'
import type { Task, TaskStatus } from '../../types'
import { PRIORITY_META, STATUS_META, STATUS_ORDER } from '../../utils/priority'
import { deadlineLabel, minutesToLabel } from '../../utils/date'
import { cn } from '../../utils/cn'
import { CompletionDialog } from './CompletionDialog'
import { useTaskStore } from '../../store/useTaskStore'
import { toast } from '../../store/useToastStore'
import { ConfirmDialog } from '../common'
import { useNavigate } from 'react-router-dom'

interface TaskItemProps {
  task: Task
  folderName: string
  folderColor: string
  view: 'list' | 'grid'
  onEdit: (task: Task) => void
}

export function TaskItem({ task, folderName, folderColor, view, onEdit }: TaskItemProps) {
  const [completing, setCompleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const setStatus = useTaskStore((s) => s.setStatus)
  const reopen = useTaskStore((s) => s.reopen)
  const remove = useTaskStore((s) => s.remove)
  const navigate = useNavigate()

  const done = task.status === 'completed'
  const priority = PRIORITY_META[task.priority]
  const status = STATUS_META[task.status]
  const overdue = !done && new Date(task.deadline).getTime() < Date.now()

  const handleStatus = (next: TaskStatus) => {
    if (next === 'completed') {
      setCompleting(true)
      return
    }
    setStatus(task.id, next)
    toast.info('Status diperbarui', `${task.title} → ${STATUS_META[next].label}`)
  }

  const handleDelete = () => {
    remove(task.id)
    toast.info('Tugas dihapus', task.title)
    setConfirmDelete(false)
  }

  const actions = (
    <>
      <button
        type="button"
        onClick={() => onEdit(task)}
        aria-label="Edit tugas"
        className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmDelete(true)}
        aria-label="Hapus tugas"
        className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </>
  )

  const checkbox = (
    <button
      type="button"
      onClick={() => (done ? reopen(task.id) : setCompleting(true))}
      aria-label={done ? 'Buka kembali tugas' : 'Tandai selesai'}
      className={cn(
        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-all',
        done
          ? 'border-success bg-success text-white'
          : 'border-line-strong bg-surface-2 hover:border-primary hover:bg-primary-soft',
      )}
    >
      {done && <Check className="size-3.5" strokeWidth={3} />}
    </button>
  )

  const statusSelect = (
    <Select
      aria-label="Ubah status"
      value={task.status}
      onChange={(e) => handleStatus(e.target.value as TaskStatus)}
      className="h-7 w-auto min-w-[6.5rem] px-2 text-[11.5px]"
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_META[s].label}
        </option>
      ))}
    </Select>
  )

  if (view === 'grid') {
    return (
      <article className="group flex flex-col rounded-card border border-line bg-surface p-4 shadow-card transition-colors hover:border-line-strong">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: folderColor }} />
            <span className="text-[11.5px] text-ink-muted">{folderName}</span>
          </div>
          <Badge className={cn('!py-px !text-[10px]', priority.className)}>{priority.label}</Badge>
        </div>

        <div className="mt-3 flex items-start gap-2.5">
          {checkbox}
          <h3
            className={cn(
              'text-[14px] font-medium leading-snug',
              done ? 'text-ink-muted line-through' : 'text-ink',
            )}
          >
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-ink-muted">
            {task.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-muted">
          <Badge tone="outline">{task.category}</Badge>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" /> {minutesToLabel(task.estimateMinutes)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-[11.5px] font-medium',
              overdue ? 'text-danger' : done ? 'text-success' : 'text-ink-muted',
            )}
          >
            <Flag className="size-3" /> {deadlineLabel(task.deadline, task.status)}
          </span>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            {actions}
          </div>
        </div>

        <div className="mt-2">{statusSelect}</div>

        <CompletionDialog
          task={completing ? task : null}
          open={completing}
          onClose={() => setCompleting(false)}
        />
        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          title="Hapus tugas?"
          tone="danger"
          confirmLabel="Hapus"
          body={`"${task.title}" akan dihapus permanen dari daftar tugas kamu.`}
        />
      </article>
    )
  }

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-line-strong sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {checkbox}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3
              className={cn(
                'text-[13.5px] font-medium leading-snug',
                done ? 'text-ink-muted line-through' : 'text-ink',
              )}
            >
              {task.title}
            </h3>
            <Badge className={cn('!py-px !text-[10px]', priority.className)}>{priority.short}</Badge>
            {overdue && (
              <Badge tone="danger" dot className="!py-px !text-[10px]">
                Lewat
              </Badge>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ background: folderColor }} />
              {folderName}
            </span>
            <span>{task.category}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> {minutesToLabel(task.estimateMinutes)}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1',
                overdue ? 'text-danger' : done ? 'text-success' : '',
              )}
            >
              <Flag className="size-3" /> {deadlineLabel(task.deadline, task.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <Badge className={cn('!py-px !text-[10px]', status.className)}>{status.label}</Badge>
        <div className="flex items-center gap-1">
          {statusSelect}
          <button
            type="button"
            onClick={() => navigate('/focus')}
            aria-label="Kerjakan di Focus Mode"
            title="Kerjakan di Focus Mode"
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <Crosshair className="size-4" />
          </button>
          {actions}
        </div>
      </div>

      <CompletionDialog
        task={completing ? task : null}
        open={completing}
        onClose={() => setCompleting(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Hapus tugas?"
        tone="danger"
        confirmLabel="Hapus"
        body={`"${task.title}" akan dihapus permanen dari daftar tugas kamu.`}
      />
    </article>
  )
}
