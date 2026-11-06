import { useNavigate } from 'react-router-dom';
import { CalendarClock, Flame, Plus, Sparkles } from 'lucide-react';
import { Avatar, Badge, Button } from '../common';
import { useProfileStore } from '../../store/useProfileStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useTaskStore } from '../../store/useTaskStore';
import { greetingEmoji, greetingFor, formatLong } from '../../utils/date';
import { levelFromXp } from '../../data/mock/gamification';
export function GreetingHeader() {
    const profile = useProfileStore((s) => s.profile);
    const progress = useProgressStore((s) => s.progress);
    const tasks = useTaskStore((s) => s.tasks);
    const navigate = useNavigate();
    const level = levelFromXp(progress.xp);
    const openCount = tasks.filter((t) => t.status !== 'completed').length;
    const overdue = tasks.filter((t) => {
        if (t.status === 'completed')
            return false;
        return new Date(t.deadline).getTime() < Date.now();
    }).length;
    return (<section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar avatarId={profile.avatarId} name={profile.displayName} size="lg" ring/>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-ink font-display sm:text-2xl">
                {greetingFor()}, {profile.displayName.split(' ')[0]} {greetingEmoji()}
              </h1>
              <Badge tone="primary" dot>
                Level {level.level}
              </Badge>
            </div>
            <p className="mt-1 text-[13px] text-ink-muted">
              {formatLong(new Date())} · {openCount} tugas masih terbuka
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={progress.currentStreak > 0 ? 'warning' : 'neutral'} icon={<Flame className="size-3"/>}>
                {progress.currentStreak} hari streak
              </Badge>
              <Badge tone="accent">{progress.xp.toLocaleString('id-ID')} XP</Badge>
              {overdue > 0 && <Badge tone="danger" dot>{overdue} terlambat</Badge>}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" icon={<Sparkles />} onClick={() => navigate('/focus')}>
            Mulai Focus Mode
          </Button>
          <Button variant="primary" icon={<Plus />} onClick={() => navigate('/tasks?new=1')}>
            Buat tugas baru
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[12.5px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="size-3.5"/>
          Fokus hari ini menentukan streak besok.
        </span>
        <span className="hidden sm:inline">·</span>
        <span>Build Your Focus. Own Your Time.</span>
      </div>
    </section>);
}
