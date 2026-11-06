import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, ChevronRight, Moon, Plus, Sun } from 'lucide-react';
import { EVENT_META } from '../../services/selectors';
import { cancelRestDay, scheduleRestDay } from '../../services/actions';
import { cn } from '../../utils/cn';
import { dayKey, formatLong, todayKey } from '../../utils/date';
import { Button, EmptyState, Panel } from '../common';
export function CalendarSidebar({ selected, entries, restDates, onCreate, onOpenEvent }) {
    const [reason, setReason] = useState('');
    const isRest = restDates.includes(selected);
    const isPast = selected < todayKey();
    const upcoming = useMemo(() => {
        const from = selected;
        const to = (() => {
            const d = new Date();
            d.setDate(d.getDate() + 14);
            return dayKey(d);
        })();
        return entries
            .filter((e) => e.date > from && e.date <= to && e.type !== 'completed')
            .sort((a, b) => (a.date === b.date ? (a.startMinute ?? 0) - (b.startMinute ?? 0) : a.date.localeCompare(b.date)))
            .slice(0, 7);
    }, [entries, selected]);
    const toggleRest = () => {
        if (isRest) {
            cancelRestDay(selected);
        }
        else {
            scheduleRestDay(selected, reason.trim() || undefined);
            setReason('');
        }
    };
    return (<div className="space-y-4 sm:space-y-5">
      <Panel title={formatLong(selected)} description={selected === todayKey() ? 'Hari ini' : isPast ? 'Hari terlewati' : 'Hari terpilih'} action={<Button size="sm" variant="outline" icon={<Plus />} onClick={() => onCreate(selected)}>
            Tambah
          </Button>}>
        <div className={cn('rounded-xl border px-4 py-3', isRest ? 'border-accent/40 bg-accent-soft' : 'border-line bg-surface-2')}>
          <div className="flex items-start gap-3">
            <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', isRest ? 'bg-accent/20 text-accent' : 'bg-surface-3 text-ink-muted')}>
              {isRest ? <Sun className="size-4"/> : <Moon className="size-4"/>}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-medium text-ink">
                {isRest ? 'Ditandai sebagai Rest Day' : 'Bukan Rest Day'}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-muted">
                Rest Day menahan streak agar tidak hilang tanpa menambah angkanya.
              </p>
            </div>
          </div>

          {!isRest && (<input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan (opsional)" className="mt-3 h-9 w-full rounded-lg border border-line bg-surface px-3 text-[13px] text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"/>)}

          <Button size="sm" variant={isRest ? 'outline' : 'accent'} fullWidth className="mt-3" onClick={toggleRest}>
            {isRest ? 'Batalkan Rest Day' : 'Tandai sebagai Rest Day'}
          </Button>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] font-medium uppercase tracking-wider text-ink-muted">Agenda mendatang</p>
            <span className="text-[12px] text-ink-muted">14 hari</span>
          </div>

          {upcoming.length === 0 ? (<EmptyState compact icon={<CalendarCheck />} title="Tidak ada agenda" description="Belum ada jadwal pada dua pekan ke depan."/>) : (<ul className="space-y-1.5">
              {upcoming.map((e) => (<li key={e.id}>
                  <button type="button" onClick={() => onOpenEvent(e)} className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-2">
                    <span className={cn('size-2 shrink-0 rounded-full', EVENT_META[e.type].dot)}/>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-ink-soft group-hover:text-ink">{e.title}</span>
                      <span className="block text-[11.5px] text-ink-muted">
                        {new Date(`${e.date}T00:00:00`).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                })}
                        {e.startMinute != null &&
                    ` · ${String(Math.floor(e.startMinute / 60)).padStart(2, '0')}:${String(e.startMinute % 60).padStart(2, '0')}`}
                      </span>
                    </span>
                    <ChevronRight className="size-3.5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"/>
                  </button>
                </li>))}
            </ul>)}

          <Link to="/reminders" className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline">
            Kelola pengingat <ChevronRight className="size-3.5"/>
          </Link>
        </div>
      </Panel>

      <Panel title="Legenda" description="Warna entri di kalender.">
        <div className="flex flex-wrap gap-2">
          {Object.keys(EVENT_META).map((k) => (<span key={k} className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11.5px] font-medium', EVENT_META[k].chip)}>
              <span className={cn('mr-1.5 inline-block size-1.5 rounded-full', EVENT_META[k].dot)}/>
              {EVENT_META[k].label}
            </span>))}
        </div>
      </Panel>
    </div>);
}
