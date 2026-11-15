import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Inbox, X } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { relativeFromNow } from '../../utils/date';
import { cn } from '../../utils/cn';
import { Button } from '../common';
import { KIND_LABEL, KIND_META } from '../reminders/notificationMeta';
export function NotificationPanel({ open, onClose }) {
    const notifications = useNotificationStore((s) => s.notifications);
    const markRead = useNotificationStore((s) => s.markRead);
    const markAllRead = useNotificationStore((s) => s.markAllRead);
    const dismiss = useNotificationStore((s) => s.dismiss);
    const navigate = useNavigate();
    const unread = notifications.filter((n) => !n.read).length;
    // Captured once per panel mount so grouping stays stable while it is open.
    const [now] = useState(() => Date.now());
    const grouped = useMemo(() => {
        const today = [];
        const earlier = [];
        const day = 86_400_000;
        for (const n of notifications) {
            if (now - new Date(n.at).getTime() < day)
                today.push(n);
            else
                earlier.push(n);
        }
        return { today, earlier };
    }, [notifications, now]);
    const handleOpen = (n) => {
        markRead(n.id);
        if (n.href) {
            navigate(n.href);
            onClose();
        }
    };
    return (<>
      {open && (<div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden/>)}
      <aside aria-hidden={!open} className={cn('fixed right-0 top-0 z-50 flex h-full w-[min(24rem,100vw)] flex-col border-l border-line bg-surface shadow-pop transition-transform duration-200 ease-out', open ? 'translate-x-0' : 'translate-x-full')}>
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-ink font-display">Notifications</h2>
            <p className="text-[12px] text-ink-muted">
              {unread > 0 ? `${unread} notifikasi belum dibaca` : 'Semua sudah dibaca'}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup notifikasi" className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink">
            <X className="size-4"/>
          </button>
        </header>

        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Terbaru
          </span>
          <button type="button" onClick={markAllRead} disabled={unread === 0} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12px] font-medium text-primary transition-colors hover:bg-primary-soft disabled:opacity-40">
            <Check className="size-3.5"/>
            Tandai semua dibaca
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (<div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex size-11 items-center justify-center rounded-xl bg-surface-2 text-ink-muted">
                <Inbox className="size-5"/>
              </div>
              <p className="text-sm font-medium text-ink">Belum ada notifikasi</p>
              <p className="text-[13px] text-ink-muted leading-relaxed">
                Reminder deadline dan aktivitas fokus akan muncul di sini.
              </p>
            </div>) : (<>
              {['today', 'earlier'].map((bucket) => {
                const list = grouped[bucket];
                if (list.length === 0)
                    return null;
                return (<section key={bucket}>
                    <div className="px-4 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      {bucket === 'today' ? 'Hari ini' : 'Sebelumnya'}
                    </div>
                    <ul className="px-2 pb-2">
                      {list.map((n) => {
                        const meta = KIND_META[n.kind];
                        const Icon = meta.icon;
                        return (<li key={n.id}>
                            <div role="button" tabIndex={0} onClick={() => handleOpen(n)} onKeyDown={(e) => e.key === 'Enter' && handleOpen(n)} className={cn('group flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2', !n.read && 'bg-primary-soft/40')}>
                              <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                                <Icon className="size-4"/>
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={cn('text-[13px] leading-snug', n.read ? 'font-medium text-ink-soft' : 'font-semibold text-ink')}>
                                    {n.title}
                                  </p>
                                  {!n.read && (<span className="mt-1 size-2 shrink-0 rounded-full bg-primary"/>)}
                                </div>
                                <p className="mt-0.5 text-[12.5px] text-ink-muted leading-snug">
                                  {n.body}
                                </p>
                                <div className="mt-1.5 flex items-center gap-2">
                                  <span className="rounded-full bg-surface-3 px-1.5 py-px text-[10px] font-medium text-ink-muted">
                                    {KIND_LABEL[n.kind]}
                                  </span>
                                  <span className="text-[11px] text-ink-muted">
                                    {relativeFromNow(n.at)}
                                  </span>
                                </div>
                              </div>
                              <button type="button" aria-label="Hapus notifikasi" onClick={(e) => {
                                e.stopPropagation();
                                dismiss(n.id);
                            }} className="shrink-0 rounded p-1 text-ink-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100">
                                <X className="size-3.5"/>
                              </button>
                            </div>
                          </li>);
                    })}
                    </ul>
                  </section>);
            })}
            </>)}
        </div>

        <footer className="border-t border-line p-3">
          <Button variant="outline" size="sm" fullWidth onClick={() => {
            navigate('/tasks');
            onClose();
        }}>
            Lihat semua tugas
          </Button>
        </footer>
      </aside>
    </>);
}
