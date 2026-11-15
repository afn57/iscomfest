import { useState } from 'react';
import { Check, Folder, FolderOpen, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { toast } from '../../store/useToastStore';
import { cn } from '../../utils/cn';
import { ConfirmDialog } from '../common';
export function FolderSidebar({ value, onChange, onAddFolder }) {
    const folders = useTaskStore((s) => s.folders);
    const tasks = useTaskStore((s) => s.tasks);
    const removeFolder = useTaskStore((s) => s.removeFolder);
    const renameFolder = useTaskStore((s) => s.renameFolder);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);
    const count = (id) => tasks.filter((t) => t.folderId === id).length;
    const total = tasks.length;
    const items = [{ id: 'all', name: 'Semua tugas', color: 'var(--primary)' }, ...folders];
    const startRename = (folder) => {
        setEditingId(folder.id);
        setEditName(folder.name);
    };
    const cancelRename = () => {
        setEditingId(null);
        setEditName('');
    };
    const commitRename = () => {
        const name = editName.trim();
        if (name.length < 2) {
            toast.error('Nama folder terlalu pendek', 'Minimal 2 karakter.');
            return;
        }
        const target = folders.find((f) => f.id === editingId);
        if (target && target.name !== name) {
            renameFolder(editingId, name);
            toast.success('Folder diperbarui', name);
        }
        cancelRename();
    };
    const confirmDelete = () => {
        if (!pendingDelete)
            return;
        const moved = count(pendingDelete.id);
        removeFolder(pendingDelete.id);
        if (value === pendingDelete.id)
            onChange('all');
        toast.info('Folder dihapus', moved > 0
            ? `${moved} tugas dipindah ke folder "Lainnya".`
            : pendingDelete.name);
        setPendingDelete(null);
    };
    const deleteCount = pendingDelete ? count(pendingDelete.id) : 0;
    return (<nav className="rounded-card border border-line bg-surface p-2.5 shadow-card">
      <div className="flex items-center justify-between px-2 pb-2 pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Folder
        </span>
        <button type="button" onClick={onAddFolder} aria-label="Tambah folder" className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-2 hover:text-primary">
          <Plus className="size-3.5"/>
        </button>
      </div>

      <ul className="space-y-0.5">
        {items.map((folder) => {
            const active = value === folder.id;
            const n = folder.id === 'all' ? total : count(folder.id);
            const editing = editingId === folder.id;
            const isReal = folder.id !== 'all';
            if (editing) {
                return (<li key={folder.id}>
                  <div className="flex items-center gap-1.5 rounded-lg bg-primary-soft px-2 py-1.5">
                    <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter')
                        commitRename();
                    if (e.key === 'Escape')
                        cancelRename();
                }} maxLength={40} aria-label="Nama folder baru" className="min-w-0 flex-1 rounded-md border border-line bg-surface px-2 py-1 text-[13px] text-ink outline-none focus:border-primary"/>
                    <button type="button" onClick={commitRename} aria-label="Simpan nama" className="rounded-md p-1 text-success transition-colors hover:bg-success-soft">
                      <Check className="size-3.5"/>
                    </button>
                    <button type="button" onClick={cancelRename} aria-label="Batal rename" className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-2">
                      <X className="size-3.5"/>
                    </button>
                  </div>
                </li>);
            }
            return (<li key={folder.id} className="group relative">
              <button type="button" onClick={() => onChange(folder.id)} className={cn('flex w-full items-center gap-2.5 rounded-lg py-2 text-left text-[13px] transition-colors', isReal ? 'pl-2.5 pr-16' : 'px-2.5', active
                    ? 'bg-primary-soft font-medium text-primary'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink')}>
                {active ? (<FolderOpen className="size-4 shrink-0"/>) : (<Folder className="size-4 shrink-0"/>)}
                <span className="size-2 shrink-0 rounded-full" style={{ background: folder.color }}/>
                <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                <span className={cn('shrink-0 rounded-full px-1.5 py-px text-[10.5px] font-medium tabular-nums', active ? 'bg-primary/20 text-primary' : 'bg-surface-3 text-ink-muted')}>
                  {n}
                </span>
              </button>

              {isReal && (<span className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 group-hover:flex group-focus-within:flex">
                  <button type="button" onClick={() => startRename(folder)} aria-label={`Rename folder ${folder.name}`} title="Rename folder" className="rounded-md p-1 text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink">
                    <Pencil className="size-3.5"/>
                  </button>
                  {folder.id !== 'others' && (<button type="button" onClick={() => setPendingDelete(folder)} aria-label={`Hapus folder ${folder.name}`} title="Hapus folder" className="rounded-md p-1 text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger">
                      <Trash2 className="size-3.5"/>
                    </button>)}
                </span>)}
            </li>);
        })}
      </ul>

      <ConfirmDialog open={pendingDelete !== null} onClose={() => setPendingDelete(null)} onConfirm={confirmDelete} title="Hapus folder?" tone="danger" confirmLabel="Hapus" body={pendingDelete
            ? `Folder "${pendingDelete.name}" akan dihapus.${deleteCount > 0 ? ` ${deleteCount} tugas di dalamnya otomatis dipindah ke folder "Lainnya".` : ''}`
            : ''}/>
    </nav>);
}
