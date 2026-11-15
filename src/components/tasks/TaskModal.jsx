import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Timer } from 'lucide-react';
import { Button, Field, Input, Modal, Select, Textarea } from '../common';
import { useTaskStore } from '../../store/useTaskStore';
import { CATEGORIES } from '../../data/mock/tasks';
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from '../../utils/priority';
import { fromDatetimeLocal, nowIso, toDatetimeLocal } from '../../utils/date';
import { cn } from '../../utils/cn';
import { toast } from '../../store/useToastStore';
const EMPTY_DRAFT = {
    title: '',
    description: '',
    category: 'General',
    folderId: 'school',
    priority: 'medium',
    status: 'todo',
    deadline: '',
    estimateMinutes: 60,
};
export function TaskModal({ open, onClose, task, defaultFolderId }) {
    const folders = useTaskStore((s) => s.folders);
    const create = useTaskStore((s) => s.create);
    const update = useTaskStore((s) => s.update);
    const [draft, setDraft] = useState(EMPTY_DRAFT);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const isEdit = Boolean(task);
    useEffect(() => {
        if (!open)
            return;
        setErrors({});
        setSaving(false);
        if (task) {
            setDraft({
                title: task.title,
                description: task.description,
                category: task.category,
                folderId: task.folderId,
                priority: task.priority,
                status: task.status,
                deadline: toDatetimeLocal(task.deadline),
                estimateMinutes: task.estimateMinutes,
            });
        }
        else {
            const fallback = new Date();
            fallback.setHours(fallback.getHours() + 6, 0, 0, 0);
            setDraft({
                ...EMPTY_DRAFT,
                folderId: defaultFolderId ?? 'school',
                deadline: toDatetimeLocal(fallback.toISOString()),
            });
        }
    }, [open, task, defaultFolderId]);
    const categories = useMemo(() => {
        const set = new Set([...CATEGORIES]);
        if (task)
            set.add(task.category);
        return [...set];
    }, [task]);
    const set = (key, value) => {
        setDraft((d) => ({ ...d, [key]: value }));
    };
    const validate = () => {
        const next = {};
        if (draft.title.trim().length < 3)
            next.title = 'Judul minimal 3 karakter.';
        if (!draft.deadline || Number.isNaN(new Date(draft.deadline).getTime()))
            next.deadline = 'Deadline wajib diisi dan harus valid.';
        if (!Number.isFinite(draft.estimateMinutes) || draft.estimateMinutes < 5)
            next.estimateMinutes = 'Estimasi minimal 5 menit.';
        if (draft.estimateMinutes > 2400)
            next.estimateMinutes = 'Estimasi maksimal 40 jam.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };
    const submit = () => {
        if (!validate())
            return;
        setSaving(true);
        window.setTimeout(() => {
            const iso = fromDatetimeLocal(draft.deadline) || nowIso();
            if (isEdit && task) {
                update(task.id, {
                    title: draft.title.trim(),
                    description: draft.description.trim(),
                    category: draft.category,
                    folderId: draft.folderId,
                    priority: draft.priority,
                    status: draft.status,
                    deadline: iso,
                    estimateMinutes: draft.estimateMinutes,
                    ...(draft.status === 'completed' && !task.completedAt
                        ? { completedAt: nowIso() }
                        : {}),
                });
                toast.success('Tugas diperbarui', draft.title.trim());
            }
            else {
                create({
                    ...draft,
                    title: draft.title.trim(),
                    description: draft.description.trim(),
                    deadline: iso,
                });
                toast.success('Tugas dibuat', `${draft.title.trim()} · ${PRIORITY_META[draft.priority].label}`);
            }
            setSaving(false);
            onClose();
        }, 320);
    };
    return (<Modal open={open} onClose={onClose} size="lg" title={isEdit ? 'Edit tugas' : 'Tugas baru'} description={isEdit
            ? 'Perbarui detail tugas. Perubahan langsung tersimpan di perangkat kamu.'
            : 'Isi detail tugas agar bisa dipantau deadline dan estimasi waktunya.'} footer={<>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button variant="primary" onClick={submit} loading={saving}>
            {isEdit ? 'Simpan perubahan' : 'Buat tugas'}
          </Button>
        </>}>
      <div className="space-y-4">
        <Field label="Nama tugas" required error={errors.title}>
          <Input value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Contoh: Selesaikan bab 4 buku kalkulus" autoFocus maxLength={120}/>
        </Field>

        <Field label="Deskripsi" hint="Opsional — jelaskan hasil yang diharapkan.">
          <Textarea value={draft.description} onChange={(e) => set('description', e.target.value)} placeholder="Langkah pengerjaan, referensi, atau kriteria selesai…" maxLength={600} rows={3}/>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategori / mata pelajaran">
            <Select value={draft.category} onChange={(e) => set('category', e.target.value)}>
              {categories.map((c) => (<option key={c} value={c}>
                  {c}
                </option>))}
            </Select>
          </Field>

          <Field label="Folder">
            <Select value={draft.folderId} onChange={(e) => set('folderId', e.target.value)}>
              {folders.map((f) => (<option key={f.id} value={f.id}>
                  {f.name}
                </option>))}
            </Select>
          </Field>
        </div>

        <Field label="Prioritas">
          <div className="flex flex-wrap gap-2">
            {PRIORITY_ORDER.map((p) => (<button key={p} type="button" onClick={() => set('priority', p)} className={cn('rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition-all', draft.priority === p
                ? PRIORITY_META[p].className
                : 'border-line bg-surface-2 text-ink-muted hover:border-line-strong hover:text-ink-soft')}>
                {PRIORITY_META[p].label}
              </button>))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Status">
            <Select value={draft.status} onChange={(e) => set('status', e.target.value)}>
              {STATUS_ORDER.map((s) => (<option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>))}
            </Select>
          </Field>

          <Field label="Deadline" required error={errors.deadline} hint={<span className="inline-flex items-center gap-1">
                <CalendarClock className="size-3"/> waktu lokal perangkat
              </span>}>
            <Input type="datetime-local" value={draft.deadline} onChange={(e) => set('deadline', e.target.value)}/>
          </Field>

          <Field label="Estimasi (menit)" error={errors.estimateMinutes} hint={<span className="inline-flex items-center gap-1">
                <Timer className="size-3"/> {Math.round(draft.estimateMinutes / 60 * 10) / 10} jam
              </span>}>
            <Input type="number" min={5} max={2400} step={5} value={draft.estimateMinutes} onChange={(e) => set('estimateMinutes', Number(e.target.value))}/>
          </Field>
        </div>
      </div>
    </Modal>);
}
