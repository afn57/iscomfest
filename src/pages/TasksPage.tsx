import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FolderPlus, Inbox, Plus } from 'lucide-react'
import {
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  RowSkeleton,
} from '../components/common'
import { FolderSidebar } from '../components/tasks/FolderSidebar'
import { TaskItem } from '../components/tasks/TaskItem'
import { TaskModal } from '../components/tasks/TaskModal'
import { TaskToolbar, type ViewMode } from '../components/tasks/TaskToolbar'
import { DEFAULT_FILTERS, applyFilters } from '../components/tasks/filters'
import { useTaskStore } from '../store/useTaskStore'
import { usePersistedState } from '../hooks/usePersistedState'
import { useSimulatedLoading } from '../hooks/useSimulatedLoading'
import { FOLDER_COLORS } from '../utils/priority'
import type { Task } from '../types'
import { toast } from '../store/useToastStore'

export function TasksPage() {
  const tasks = useTaskStore((s) => s.tasks)
  const folders = useTaskStore((s) => s.folders)
  const addFolder = useTaskStore((s) => s.addFolder)

  const [params, setParams] = useSearchParams()
  const [folder, setFolder] = useState('all')
  const [filter, setFilter] = useState(DEFAULT_FILTERS)
  const [view, setView] = usePersistedState<ViewMode>('focusly_task_view', 'list')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [folderOpen, setFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const loading = useSimulatedLoading(300)

  useEffect(() => {
    if (params.get('new') === '1') {
      setEditing(null)
      setModalOpen(true)
      params.delete('new')
      setParams(params, { replace: true })
    }
  }, [params, setParams])

  const scoped = useMemo(
    () => (folder === 'all' ? tasks : tasks.filter((t) => t.folderId === folder)),
    [tasks, folder],
  )
  const visible = useMemo(() => applyFilters(scoped, filter), [scoped, filter])
  const folderName = folder === 'all' ? 'Semua tugas' : (folders.find((f) => f.id === folder)?.name ?? 'Folder')

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const submitFolder = () => {
    const name = newFolderName.trim()
    if (name.length < 2) {
      toast.error('Nama folder terlalu pendek', 'Minimal 2 karakter.')
      return
    }
    const created = addFolder(name, newFolderColor)
    setFolder(created.id)
    setFolderOpen(false)
    setNewFolderName('')
    toast.success('Folder dibuat', name)
  }

  return (
    <>
      <PageHeader
        title="My Tasks"
        description="Kelola seluruh tugas — kelompokkan per folder, prioritaskan, dan tandai selesai dengan konfirmasi."
        crumbs={[{ label: 'FOCUSLY', to: '/dashboard' }, { label: 'My Tasks' }]}
        actions={
          <Button icon={<Plus />} onClick={openNew}>
            Tugas baru
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[212px_minmax(0,1fr)] lg:gap-5">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <FolderSidebar
            value={folder}
            onChange={setFolder}
            onAddFolder={() => setFolderOpen(true)}
          />
        </div>

        <div className="min-w-0 space-y-4">
          <TaskToolbar
            filter={filter}
            onChange={(patch) => setFilter((f) => ({ ...f, ...patch }))}
            onReset={() => setFilter(DEFAULT_FILTERS)}
            view={view}
            onView={setView}
            resultCount={visible.length}
            totalCount={scoped.length}
          />

          {loading ? (
            <div className="space-y-2.5">
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
              <RowSkeleton />
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={<Inbox />}
              title={folderName === 'Semua tugas' ? 'Belum ada tugas' : `Folder ${folderName} kosong`}
              description={
                filter.query || filter.status !== 'all' || filter.priority !== 'all'
                  ? 'Tidak ada tugas yang cocok dengan filter saat ini. Coba longgarkan filternya.'
                  : 'Buat tugas pertama agar bisa dilacak deadline, estimasi, dan progresnya.'
              }
              action={
                filter.query || filter.status !== 'all' ? (
                  <Button variant="outline" onClick={() => setFilter(DEFAULT_FILTERS)}>
                    Reset filter
                  </Button>
                ) : (
                  <Button icon={<Plus />} onClick={openNew}>
                    Buat tugas
                  </Button>
                )
              }
            />
          ) : view === 'grid' ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((task) => {
                const f = folders.find((x) => x.id === task.folderId)
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    view="grid"
                    folderName={f?.name ?? 'Folder'}
                    folderColor={f?.color ?? 'var(--primary)'}
                    onEdit={(t) => {
                      setEditing(t)
                      setModalOpen(true)
                    }}
                  />
                )
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {visible.map((task) => {
                const f = folders.find((x) => x.id === task.folderId)
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    view="list"
                    folderName={f?.name ?? 'Folder'}
                    folderColor={f?.color ?? 'var(--primary)'}
                    onEdit={(t) => {
                      setEditing(t)
                      setModalOpen(true)
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editing}
        defaultFolderId={folder === 'all' ? undefined : folder}
      />

      <Modal
        open={folderOpen}
        onClose={() => setFolderOpen(false)}
        title="Folder baru"
        description="Folder membantu mengelompokkan tugas per konteks."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFolderOpen(false)}>
              Batal
            </Button>
            <Button onClick={submitFolder} icon={<FolderPlus className="size-4" />}>
              Buat folder
            </Button>
          </>
        }
      >
        <Field label="Nama folder" required>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Contoh: Skripsi, Kerja Praktik"
            autoFocus
            maxLength={40}
          />
        </Field>
        <div className="mt-4">
          <span className="mb-2 block text-[13px] font-medium text-ink-soft">Warna</span>
          <div className="flex flex-wrap gap-2">
            {FOLDER_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewFolderColor(color)}
                aria-label={`Pilih warna ${color}`}
                className={`size-8 rounded-lg transition-transform ${
                  newFolderColor === color ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'hover:scale-105'
                }`}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>
      </Modal>
    </>
  )
}
