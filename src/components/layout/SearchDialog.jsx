import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, Folder, Search, CornerDownLeft } from 'lucide-react';
import { Modal, IconByName } from '../common';
import { useTaskStore } from '../../store/useTaskStore';
import { SEARCHABLE_ROUTES } from './navItems';
import { cn } from '../../utils/cn';
import { deadlineUrgency } from '../../utils/date';
export function SearchDialog({ open, onClose }) {
    const [query, setQuery] = useState('');
    const [active, setActive] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const tasks = useTaskStore((s) => s.tasks);
    const folders = useTaskStore((s) => s.folders);
    useEffect(() => {
        if (open) {
            setQuery('');
            setActive(0);
            const t = window.setTimeout(() => inputRef.current?.focus(), 60);
            return () => window.clearTimeout(t);
        }
    }, [open]);
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        const pages = SEARCHABLE_ROUTES.map((r) => ({
            type: 'page',
            id: `page-${r.to}-${r.label}`,
            label: r.label,
            description: r.description,
            icon: r.icon,
            to: r.to,
        }));
        const taskResults = tasks.map((t) => ({
            type: 'task',
            id: t.id,
            label: t.title,
            description: `${folders.find((f) => f.id === t.folderId)?.name ?? 'Folder'} · ${t.category}`,
            status: t.status,
            folder: t.folderId,
            to: '/tasks',
            urgency: deadlineUrgency(t.deadline, t.status),
        }));
        if (!q)
            return [...pages.slice(0, 6), ...taskResults.filter((t) => t.urgency === 'overdue').slice(0, 4)];
        return [...pages, ...taskResults]
            .filter((r) => r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
            .slice(0, 12);
    }, [query, tasks, folders]);
    const go = (r) => {
        if (!r)
            return;
        navigate(r.to);
        onClose();
    };
    return (<Modal open={open} onClose={onClose} size="lg" className="sm:top-[12vh] sm:self-start">
      <div className="-mx-5 -my-4">
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-ink-muted"/>
          <input ref={inputRef} value={query} onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
        }} onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
            }
            else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
            }
            else if (e.key === 'Enter') {
                go(results[active]);
            }
        }} placeholder="Cari tugas, halaman, atau fitur…" className="h-14 w-full bg-transparent text-[15px] text-ink placeholder:text-ink-muted focus:outline-none"/>
          <kbd className="hidden shrink-0 rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] text-ink-muted sm:block">
            Esc
          </kbd>
        </div>

        <div className="max-h-[min(24rem,55vh)] overflow-y-auto p-2">
          {results.length === 0 ? (<p className="px-3 py-10 text-center text-[13px] text-ink-muted">
              Tidak ada hasil untuk “{query}”.
            </p>) : (results.map((r, i) => (<button key={r.id} type="button" onMouseEnter={() => setActive(i)} onClick={() => go(r)} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors', i === active ? 'bg-primary-soft' : 'hover:bg-surface-2')}>
                <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', r.type === 'page' ? 'bg-surface-3 text-ink-soft' : 'bg-primary-soft text-primary')}>
                  {r.type === 'page' ? (<SearchGlyph name={r.icon}/>) : r.urgency === 'overdue' ? (<Clock className="size-4 text-danger"/>) : (<FileText className="size-4"/>)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium text-ink">{r.label}</span>
                  <span className="block truncate text-[12px] text-ink-muted">{r.description}</span>
                </span>
                {r.type === 'task' && r.urgency === 'overdue' && (<span className="shrink-0 rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-semibold text-danger">
                    Lewat
                  </span>)}
                {i === active && (<CornerDownLeft className="size-3.5 shrink-0 text-ink-muted"/>)}
              </button>)))}
        </div>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-line bg-surface-2 px-1 py-px">↑</kbd>
            <kbd className="rounded border border-line bg-surface-2 px-1 py-px">↓</kbd> navigasi
          </span>
          <span className="inline-flex items-center gap-1">
            <Folder className="size-3"/> {tasks.length} tugas tersimpan
          </span>
        </div>
      </div>
    </Modal>);
}
function SearchGlyph({ name }) {
    return <IconByName name={name} className="size-4"/>;
}
