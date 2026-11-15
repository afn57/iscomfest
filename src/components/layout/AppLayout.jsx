import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useThemeSync } from '../../hooks/useThemeSync';
import { useProfileAppearance } from '../../hooks/useProfileAppearance';
import { useReminderEngine } from '../../services/reminders';
import { useAppTickers } from '../../hooks/useTickers';
import { initFocusGuard } from '../../services/focusGuard';
export function AppLayout() {
    useThemeSync();
    useProfileAppearance();
    useReminderEngine();
    useAppTickers();
    useEffect(() => {
        initFocusGuard();
    }, []);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const location = useLocation();
    useEffect(() => {
        setDrawerOpen(false);
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [location.pathname]);
    useEffect(() => {
        if (!drawerOpen)
            return;
        const onKey = (e) => e.key === 'Escape' && setDrawerOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [drawerOpen]);
    return (<div className="flex min-h-screen bg-page">
      <Sidebar className="sticky top-0 hidden h-screen shrink-0 lg:flex"/>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setDrawerOpen(true)}/>
        <main className="flex-1 px-4 pb-20 pt-5 sm:px-6 sm:pt-6 lg:pb-10" style={{ backgroundImage: 'var(--profile-bg)' }}>
          <div className="mx-auto w-full max-w-[1400px] animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />

      {drawerOpen &&
            createPortal(<div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} aria-hidden/>
            <div className="absolute inset-y-0 left-0 animate-[fade-up_0.2s_ease-out]">
              <Sidebar variant="drawer" className="h-full shadow-pop" onNavigate={() => setDrawerOpen(false)}/>
            </div>
            <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Tutup menu" className="absolute right-3 top-3 rounded-lg bg-surface-2 p-2 text-ink-muted">
              <X className="size-4"/>
            </button>
          </div>, document.body)}
    </div>);
}
