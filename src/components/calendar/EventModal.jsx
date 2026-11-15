import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarX2, Save, Trash2 } from 'lucide-react';
import { EVENT_META } from '../../services/selectors';
import { useCalendarStore } from '../../store/useCalendarStore';
import { toast } from '../../store/useToastStore';
import { formatLong } from '../../utils/date';
import { cn } from '../../utils/cn';
import { Button, ConfirmDialog, Field, Input, Modal, Select, Textarea } from '../common';
const isDerived = (id) => id.startsWith('task-');
function toForm(e, defaultDate) {
    const hhmm = (m) => (m == null ? '' : `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
    return {
        title: e?.title ?? '',
        type: e?.type ?? 'event',
        date: e?.date ?? defaultDate,
        start: hhmm(e?.startMinute),
        end: hhmm(e?.endMinute),
        note: e?.note ?? '',
    };
}
export function EventModal({ open, event, defaultDate, onClose }) {
    const addEvent = useCalendarStore((s) => s.addEvent);
    const updateEvent = useCalendarStore((s) => s.updateEvent);
    const removeEvent = useCalendarStore((s) => s.removeEvent);
    const addRestDay = useCalendarStore((s) => s.addRestDay);
    const removeRestDayByDate = useCalendarStore((s) => s.removeRestDayByDate);
    const [form, setForm] = useState(() => toForm(event, defaultDate));
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    useEffect(() => {
        if (open) {
            setForm(toForm(event, defaultDate));
            setError('');
            setConfirmDelete(false);
        }
    }, [open, event, defaultDate]);
    const derived = event ? isDerived(event.id) : false;
    const toMinute = (v) => (v ? Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5)) : undefined);
    const save = () => {
        const title = form.title.trim();
        if (title.length < 2) {
            setError('Judul minimal 2 karakter.');
            return;
        }
        const startMinute = toMinute(form.start);
        const endMinute = toMinute(form.end);
        if (startMinute != null && endMinute != null && endMinute <= startMinute) {
            setError('Waktu selesai harus setelah waktu mulai.');
            return;
        }
        const payload = {
            title,
            type: form.type,
            date: form.date,
            startMinute,
            endMinute,
            note: form.note.trim() || undefined,
        };
        if (event && !derived) {
            updateEvent(event.id, payload);
            toast.success('Jadwal diperbarui', title);
        }
        else {
            addEvent(payload);
            toast.success('Jadwal ditambahkan', `${title} · ${formatLong(form.date)}`);
        }
        if (payload.type === 'rest')
            addRestDay(form.date, payload.note);
        onClose();
    };
    const remove = () => {
        if (!event)
            return;
        removeEvent(event.id);
        removeRestDayByDate(event.date);
        setConfirmDelete(false);
        onClose();
        toast.info('Jadwal dihapus', event.title);
    };
    return (<>
      <Modal open={open} onClose={onClose} title={derived ? 'Detail dari tugas' : event ? 'Edit jadwal' : 'Jadwal baru'} description={derived ? 'Entri ini dibuat otomatis dari tenggat tugas.' : 'Atur jadwal fokus, deadline, atau waktu istirahat.'} size="md" footer={<div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {event && !derived && (<Button variant="ghost" icon={<Trash2 />} onClick={() => setConfirmDelete(true)}>
                  Hapus
                </Button>)}
              {derived && (<Button variant="outline" icon={<CalendarX2 />} onClick={onClose}>
                  Tutup
                </Button>)}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>
                Batal
              </Button>
              {!derived && (<Button variant="primary" icon={<Save />} onClick={save}>
                  Simpan
                </Button>)}
            </div>
          </div>}>
        <div className="space-y-4">
          <Field label="Judul" required error={error && form.title.trim().length < 2 ? error : undefined}>
            <Input value={form.title} disabled={derived} placeholder="Mis. Fokus laporan mingguan" onChange={(e) => {
            setForm((f) => ({ ...f, title: e.target.value }));
            setError('');
        }}/>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jenis">
              <Select value={form.type} disabled={derived} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {Object.keys(EVENT_META).map((t) => (<option key={t} value={t}>
                    {EVENT_META[t].label}
                  </option>))}
              </Select>
            </Field>
            <Field label="Tanggal" required>
              <Input type="date" value={form.date} disabled={derived} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}/>
            </Field>
            <Field label="Mulai" hint="opsional">
              <Input type="time" value={form.start} disabled={derived} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))}/>
            </Field>
            <Field label="Selesai" hint="opsional">
              <Input type="time" value={form.end} disabled={derived} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))}/>
            </Field>
          </div>

          {error && form.title.trim().length >= 2 && <p className="text-[12px] text-danger">{error}</p>}

          <Field label="Catatan" hint="opsional">
            <Textarea rows={3} value={form.note} disabled={derived} placeholder="Mis. Ruang tenang, mode deep work" onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}/>
          </Field>

          {derived && (<div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3">
              <div className="min-w-0">
                <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10.5px] font-medium', EVENT_META[event.type].chip)}>
                  {EVENT_META[event.type].label}
                </span>
                <p className="mt-1.5 text-[12.5px] text-ink-muted">
                  Ubah tanggal atau status di halaman Tasks agar kalender ikut menyesuaikan.
                </p>
              </div>
              <Link to="/tasks" onClick={onClose} className="shrink-0 rounded-lg border border-line px-3 py-1.5 text-[12.5px] font-medium text-primary transition-colors hover:bg-primary-soft">
                Buka Tasks
              </Link>
            </div>)}
        </div>
      </Modal>

      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={remove} title="Hapus jadwal ini?" tone="danger" confirmLabel="Hapus" body={`"${event?.title}" akan dihapus dari kalender. Tugas aslinya tidak ikut terhapus.`}/>
    </>);
}
