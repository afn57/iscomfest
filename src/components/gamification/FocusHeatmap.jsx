import { useMemo } from 'react';
import { focusHeatmap } from '../../services/selectors';
import { cn } from '../../utils/cn';
import { Panel } from '../common';
function level(minutes) {
    if (minutes <= 0)
        return 0;
    if (minutes <= 30)
        return 1;
    if (minutes <= 60)
        return 2;
    return 3;
}
const SHADES = ['bg-surface-2', 'bg-primary/30', 'bg-primary/60', 'bg-primary'];
export function FocusHeatmap() {
    const cells = useMemo(() => focusHeatmap(84), []);
    const columns = useMemo(() => {
        const out = [];
        let current = [];
        for (const cell of cells) {
            if (cell.date.getDay() === 1 && current.length > 0) {
                out.push(current);
                current = [];
            }
            current.push(cell);
        }
        if (current.length > 0)
            out.push(current);
        return out;
    }, [cells]);
    const total = cells.reduce((sum, c) => sum + c.minutes, 0);
    const activeDays = cells.filter((c) => c.minutes > 0).length;
    return (<Panel title="Focus heatmap" description={`${activeDays} hari aktif dari ${cells.length} hari terakhir · total ${Math.round(total / 60)} jam fokus.`}>
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1.5">
          {columns.map((col, i) => (<div key={i} className="flex flex-col gap-1.5">
              {col.map((cell) => (<span key={cell.key} title={`${cell.date.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                })} · ${cell.minutes} menit fokus`} className={cn('size-3.5 rounded-[4px]', SHADES[level(cell.minutes)])}/>))}
            </div>))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11.5px] text-ink-muted">
          <span>Kurang</span>
          {SHADES.map((s) => (<span key={s} className={cn('size-3.5 rounded-[4px]', s)}/>))}
          <span>Banyak</span>
        </div>
        <div className="flex items-center gap-3 text-[11.5px] text-ink-muted">
          <span>
            0 mnt · <span className="text-primary">≤30</span> · ≤60 · {'>'}60
          </span>
        </div>
      </div>
    </Panel>);
}
