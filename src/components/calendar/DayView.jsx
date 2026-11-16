import { EVENT_META } from '../../services/selectors';
import { cn } from '../../utils/cn';
import { formatLong, minuteOfDayToClock, todayKey } from '../../utils/date';
import { Button, EmptyState } from '../common';
import { CalendarPlus } from 'lucide-react';
export function DayView({ entries, restDates, selected, onCreate, onOpenEvent }) {
    const list = entries.filter((e) => e.date === selected).sort((a, b) => (a.startMinute ?? 0) - (b.startMinute ?? 0));
    const isRest = restDates.includes(selected);
    const today = todayKey();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const timed = list.filter((e) => e.startMinute != null);
    const untimed = list.filter((e) => e.startMinute == null);
    return (<div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h3 className="font-display text-[15px] font-semibold text-ink">{formatLong(selected)}</h3>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            {list.length} aktivitas terjadwal
            {selected === today && <span className="text-primary"> · hari ini</span>}
            {isRest && <span className="text-accent"> · Rest Day</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" icon={<CalendarPlus />} className="whitespace-nowrap" onClick={() => onCreate(selected)}>
            Tambah jadwal
          </Button>
        </div>
      </div>

      {list.length === 0 ? (<div className="px-4 py-3">
          <EmptyState compact icon={<CalendarPlus />} title="Hari ini masih kosong" description="Tambahkan jadwal, atau tandai sebagai Rest Day agar streak tetap terjaga."/>
        </div>) : (<div className="max-h-[30rem] overflow-y-auto px-4 py-3">
          <div className="grid gap-3 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
            <div className="hidden flex-col gap-1 sm:flex">
              {hours.map((h) => (<div key={h} className="h-8 text-[10.5px] tabular-nums text-ink-muted">
                  {String(h).padStart(2, '0')}:00
                </div>))}
            </div>

            <div className="space-y-1.5">
              {timed.map((e) => (<button key={e.id} type="button" onClick={() => onOpenEvent(e)} className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-surface-2 sm:grid-cols-[auto_5rem_minmax(0,1fr)_auto] sm:gap-y-0">
                  <span className={cn('row-span-3 size-2 shrink-0 rounded-full sm:row-span-1', EVENT_META[e.type].dot)}/>
                  <span className="col-start-2 row-start-1 text-[12px] tabular-nums text-ink-muted sm:col-start-2 sm:row-start-1 sm:w-20 sm:text-[12.5px]">
                    {minuteOfDayToClock(e.startMinute)}
                    {e.endMinute != null ? `–${minuteOfDayToClock(e.endMinute)}` : ''}
                  </span>
                  <span className="col-start-2 row-start-2 min-w-0 sm:col-start-3 sm:row-start-1">
                    <span className="block break-words text-[13.5px] font-medium text-ink sm:truncate">{e.title}</span>
                    {e.note && <span className="block break-words text-[11.5px] text-ink-muted sm:truncate">{e.note}</span>}
                  </span>
                  <span className={cn('col-start-2 row-start-3 justify-self-start rounded-full px-2 py-0.5 text-[10.5px] font-medium sm:col-start-4 sm:row-start-1', EVENT_META[e.type].chip)}>
                    {EVENT_META[e.type].label}
                  </span>
                </button>))}

              {untimed.map((e) => (<button key={e.id} type="button" onClick={() => onOpenEvent(e)} className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 rounded-xl border border-dashed border-line px-3 py-2.5 text-left transition-colors hover:border-primary/50 sm:grid-cols-[auto_5rem_minmax(0,1fr)_auto] sm:gap-y-0">
                  <span className={cn('row-span-3 size-2 shrink-0 rounded-full sm:row-span-1', EVENT_META[e.type].dot)}/>
                  <span className="col-start-2 row-start-1 text-[12px] text-ink-muted sm:col-start-2 sm:row-start-1 sm:w-20">sepanjang hari</span>
                  <span className="col-start-2 row-start-2 min-w-0 break-words text-[13.5px] text-ink sm:col-start-3 sm:row-start-1 sm:truncate">{e.title}</span>
                  <span className={cn('col-start-2 row-start-3 justify-self-start rounded-full px-2 py-0.5 text-[10.5px] font-medium sm:col-start-4 sm:row-start-1', EVENT_META[e.type].chip)}>
                    {EVENT_META[e.type].label}
                  </span>
                </button>))}
            </div>
          </div>
        </div>)}
    </div>);
}
