import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout';
import { ToastViewport } from './components/common';
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const TasksPage = lazy(() => import('./pages/TasksPage').then((m) => ({ default: m.TasksPage })));
const FocusPage = lazy(() => import('./pages/FocusPage').then((m) => ({ default: m.FocusPage })));
const CalendarPage = lazy(() => import('./pages/CalendarPage').then((m) => ({ default: m.CalendarPage })));
const RemindersPage = lazy(() => import('./pages/RemindersPage').then((m) => ({ default: m.RemindersPage })));
const StreakPage = lazy(() => import('./pages/StreakPage').then((m) => ({ default: m.StreakPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
function PageFallback() {
    return (<div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="size-8 animate-spin rounded-full border-2 border-line border-t-primary"/>
        <p className="text-[13px] text-ink-muted">Memuat halaman...</p>
      </div>
    </div>);
}
export default function App() {
    return (<BrowserRouter>
      <Routes>
        <Route element={<Suspense fallback={<PageFallback />}>
              <AppLayout />
            </Suspense>}>
          <Route index element={<Navigate to="/dashboard" replace/>}/>
          <Route path="/dashboard" element={<DashboardPage />}/>
          <Route path="/tasks" element={<TasksPage />}/>
          <Route path="/focus" element={<FocusPage />}/>
          <Route path="/calendar" element={<CalendarPage />}/>
          <Route path="/reminders" element={<RemindersPage />}/>
          <Route path="/streak" element={<StreakPage />}/>
          <Route path="/achievements" element={<Navigate to="/streak" replace/>}/>
          <Route path="/profile" element={<ProfilePage />}/>
          <Route path="/settings" element={<SettingsPage />}/>
          <Route path="*" element={<NotFoundPage />}/>
        </Route>
      </Routes>
      <ToastViewport />
    </BrowserRouter>);
}
