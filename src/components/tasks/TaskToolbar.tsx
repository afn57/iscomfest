import { useMemo } from 'react'
import { LayoutGrid, List, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import { Input, Select } from '../common'
import type { Priority, TaskStatus } from '../../types'
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from '../../utils/priority'
import {
  applyFilters,
  isFilterActive,
  type DeadlineFilter,
  type SortKey,
  type TaskFilterState,
} from './filters'
import { useTaskStore } from '../../store/useTaskStore'
import { cn } from '../../utils/cn'

export type ViewMode = 'list' | 'grid'

interface TaskToolbarProps {
  filter: TaskFilterState
  onChange: (patch: Partial<TaskFilterState>) => void
  onReset: () => void
  view: ViewMode
  onView: (view: ViewMode) => void
  resultCount: number
  totalCount: number
}

export function TaskToolbar({
  filter,
  onChange,
  onReset,
  view,
  onView,
  resultCount,
  totalCount,
}: TaskToolbarProps) {
  const tasks = useTaskStore((s) => s.tasks)
  const categories = useMemo(
    () => [...new Set(tasks.map((t) => t.category))].sort(),
    [tasks],
  )
  const active = isFilterActive(filter)

  return (
    <div className="rounded-card border border-line bg-surface p-3 shadow-card">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[200px] flex-1">
            <Input
              icon={<Search className="size-4" />}
              placeholder="Cari judul, deskripsi, atau kategori…"
              value={filter.query}
              onChange={(e) => onChange({ query: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface-2 p-1">
            <button
              type="button"
              onClick={() => onView('list')}
              aria-label="Tampilan list"
              aria-pressed={view === 'list'}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                view === 'list' ? 'bg-surface text-primary shadow-sm' : 'text-ink-muted hover:text-ink',
              )}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onView('grid')}
              aria-label="Tampilan grid"
              aria-pressed={view === 'grid'}
              className={cn(
                'rounded-md p-1.5 transition-colors',
                view === 'grid' ? 'bg-surface text-primary shadow-sm' : 'text-ink-muted hover:text-ink',
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-muted">
            <SlidersHorizontal className="size-3.5" /> Filter
          </span>

          <Select
            aria-label="Filter status"
            value={filter.status}
            onChange={(e) => onChange({ status: e.target.value as TaskStatus | 'all' })}
            className="h-8 w-auto min-w-[8.5rem] text-[12.5px]"
          >
            <option value="all">Semua status</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filter prioritas"
            value={filter.priority}
            onChange={(e) => onChange({ priority: e.target.value as Priority | 'all' })}
            className="h-8 w-auto min-w-[8.5rem] text-[12.5px]"
          >
            <option value="all">Semua prioritas</option>
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filter kategori"
            value={filter.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="h-8 w-auto min-w-[8.5rem] text-[12.5px]"
          >
            <option value="all">Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select
            aria-label="Filter deadline"
            value={filter.deadline}
            onChange={(e) => onChange({ deadline: e.target.value as DeadlineFilter })}
            className="h-8 w-auto min-w-[8.5rem] text-[12.5px]"
          >
            <option value="all">Semua deadline</option>
            <option value="overdue">Terlambat</option>
            <option value="today">Hari ini</option>
            <option value="week">7 hari ke depan</option>
            <option value="upcoming">Belum lewat</option>
          </Select>

          <Select
            aria-label="Urutkan"
            value={filter.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
            className="h-8 w-auto min-w-[8.5rem] text-[12.5px]"
          >
            <option value="deadline">Urut: deadline</option>
            <option value="priority">Urut: prioritas</option>
            <option value="created">Urut: terbaru</option>
            <option value="title">Urut: judul</option>
          </Select>

          {active && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-danger/30 bg-danger-soft px-3 text-[12.5px] font-medium text-danger transition-colors hover:bg-danger hover:text-white"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          )}

          <span className="ml-auto text-[12px] tabular-nums text-ink-muted">
            {resultCount} / {totalCount} tugas
          </span>
        </div>
      </div>

      {active && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-line pt-2.5">
          {filter.query && <Chip label={`Cari: ${filter.query}`} onClear={() => onChange({ query: '' })} />}
          {filter.status !== 'all' && (
            <Chip
              label={STATUS_META[filter.status].label}
              onClear={() => onChange({ status: 'all' })}
            />
          )}
          {filter.priority !== 'all' && (
            <Chip
              label={PRIORITY_META[filter.priority].label}
              onClear={() => onChange({ priority: 'all' })}
            />
          )}
          {filter.category !== 'all' && (
            <Chip label={filter.category} onClear={() => onChange({ category: 'all' })} />
          )}
          {filter.deadline !== 'all' && (
            <Chip label={`Deadline: ${filter.deadline}`} onClear={() => onChange({ deadline: 'all' })} />
          )}
        </div>
      )}
    </div>
  )
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 py-0.5 pl-2.5 pr-1.5 text-[11.5px] text-ink-soft">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Hapus filter ${label}`}
        className="rounded-full p-0.5 text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}

export { applyFilters }
