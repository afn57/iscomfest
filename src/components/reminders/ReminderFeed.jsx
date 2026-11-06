import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Inbox, Trash2 } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { relativeFromNow } from '../../utils/date';
import { cn } from '../../utils/cn';
import { Button, ConfirmDialog, EmptyState, Panel } from '../common';
import { KIND_LABEL, KIND_META, NOTIFICATION_KINDS } from './notificationMeta';
export function ReminderFeed() {
    const notifications = useNotificationStore((s) => s.notifications);
    const markRead = useNotificationStore((s) => s.markRead);
    const markAllRead = useNotificationStore((s) => s.markAllRead);
    const dismiss = useNotificationStore((s) => s.dismiss);
    const clear = useNotificationStore((s) => s.clear);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all');
    const [confirmClear, setConfirmClear] = useState(false);
    const unread = notifications.filter((n) => !n.read).length;
    const presentKinds = useMemo(() => NOTIFICATION_KINDS.filter((k) => notifications.some((n) => n.kind === k)), [notifications]);
    const list = notifications.filter((n) => {
        if (filter === 'all')
            return true;
        if (filter === 'unread')
            return !n.read;
        return n.kind === filter;
    });
    const open = (n) => {
        markRead(n.id);
        if (n.href)
            navigate(n.href);
    };
    return (<>
      <Panel title="Riwayat notifikasi" description={`${notifications.length} notifikasi · ${unread} belum dibaca.`} padding="none" action={<div className="flex flex-wrap items-center gap-1.5">
            <Button size="sm" variant="ghost" icon={<CheckCheck />} disabled={unread === 0} onClick={markAllRead}>
              Baca semua
            </Button>
            <Button size="sm" variant="ghost" icon={<Trash2 />} disabled={notifications.length === 0} onClick={() => setConfirmClear(true)}>
              Bersihkan
            </Button>
          </div>}>
        <div className="flex flex-wrap gap-1.5 border-b border-line px-5 py-3">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            Semua
          </Chip>
          <Chip active={filter === 'unread'} onClick={() => setFilter('unread')} count={unread}>
            Belum dibaca
          </Chip>
          {presentKinds.map((k) => (<Chip key={k} active={filter === k} onClick={() => setFilter(k)}>
              {KIND_LABEL[k]}
            </Chip>))}
        </div>

        {list.length === 0 ? (<div className="px-5 pb-5">
            <EmptyState compact icon={<Inbox />} title={filter === 'all' ? 'Belum ada notifikasi' : 'Tidak ada yang cocok'} description={filter === 'all'
                ? 'Notifikasi deadline, fokus, dan streak akan muncul di sini.'
                : 'Coba ganti filter untuk melihat notifikasi lain.'}/>
          </div>) : (<ul className="max-h-[32rem] divide-y divide-line overflow-y-auto">
            {list.map((n) => {
                const meta = KIND_META[n.kind];
                const Icon = meta.icon;
                return (<li key={n.id} className="group relative flex items-start gap-3 px-5 py-3.5">
                  <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                    <Icon className="size-4"/>
                  </span>
                  <button type="button" onClick={() => open(n)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-2">
                      {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary"/>}
                      <span className={cn('truncate text-[13.5px]', n.read ? 'text-ink-soft' : 'font-medium text-ink')}>
                        {n.title}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-ink-muted">{n.body}</span>
                    <span className="mt-1 block text-[11.5px] text-ink-muted/80">
                      {KIND_LABEL[n.kind]} · {relativeFromNow(n.at)}
                    </span>
                  </button>
                  <button type="button" aria-label="Hapus notifikasi" onClick={() => dismiss(n.id)} className="shrink-0 rounded-lg p-1.5 text-ink-muted opacity-0 transition-all hover:bg-surface-2 hover:text-danger focus:opacity-100 group-hover:opacity-100">
                    <Trash2 className="size-3.5"/>
                  </button>
                </li>);
            })}
          </ul>)}
      </Panel>

      <ConfirmDialog open={confirmClear} onClose={() => setConfirmClear(false)} onConfirm={() => {
            clear();
            setConfirmClear(false);
        }} title="Bersihkan semua notifikasi?" tone="danger" confirmLabel="Bersihkan" body="Seluruh riwayat notifikasi di perangkat ini akan dihapus. Tugas dan aktivitas tidak ikut terhapus."/>
    </>);
}
function Chip({ active, count, onClick, children, }) {
    return (<button type="button" onClick={onClick} className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors', active
            ? 'border-primary bg-primary-soft text-primary'
            : 'border-line text-ink-muted hover:border-line-strong hover:text-ink-soft')}>
      {children}
      {count != null && count > 0 && (<span className={cn('min-w-4 rounded-full px-1 text-center text-[10.5px] leading-4', active ? 'bg-primary text-white' : 'bg-surface-3 text-ink-soft')}>
          {count}
        </span>)}
    </button>);
}
