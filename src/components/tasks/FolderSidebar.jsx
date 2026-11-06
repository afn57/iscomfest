import { Folder, FolderOpen, Plus } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { cn } from '../../utils/cn';
export function FolderSidebar({ value, onChange, onAddFolder }) {
    const folders = useTaskStore((s) => s.folders);
    const tasks = useTaskStore((s) => s.tasks);
    const count = (id) => tasks.filter((t) => t.folderId === id).length;
    const total = tasks.length;
    const items = [{ id: 'all', name: 'Semua tugas', color: 'var(--primary)' }, ...folders];
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
            return (<li key={folder.id}>
              <button type="button" onClick={() => onChange(folder.id)} className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors', active
                    ? 'bg-primary-soft font-medium text-primary'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink')}>
                {active ? (<FolderOpen className="size-4 shrink-0"/>) : (<Folder className="size-4 shrink-0"/>)}
                <span className="size-2 shrink-0 rounded-full" style={{ background: folder.color }}/>
                <span className="min-w-0 flex-1 truncate">{folder.name}</span>
                <span className={cn('shrink-0 rounded-full px-1.5 py-px text-[10.5px] font-medium tabular-nums', active ? 'bg-primary/20 text-primary' : 'bg-surface-3 text-ink-muted')}>
                  {n}
                </span>
              </button>
            </li>);
        })}
      </ul>
    </nav>);
}
