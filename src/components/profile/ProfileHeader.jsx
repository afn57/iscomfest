import { useState } from 'react';
import { CalendarDays, Check, Pencil, User } from 'lucide-react';
import { levelFromXp } from '../../data/mock/gamification';
import { findBanner } from '../../data/mock/profile';
import { useProfileStore } from '../../store/useProfileStore';
import { useProgressStore } from '../../store/useProgressStore';
import { toast } from '../../store/useToastStore';
import { Avatar, Badge, Button, Field, Input, Modal, Textarea } from '../common';
export function ProfileHeader() {
    const profile = useProfileStore((s) => s.profile);
    const update = useProfileStore((s) => s.update);
    const xp = useProgressStore((s) => s.progress.xp);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ displayName: profile.displayName, username: profile.username, bio: profile.bio });
    const [error, setError] = useState('');
    const level = levelFromXp(xp);
    const banner = findBanner(profile.bannerId);
    const edit = () => {
        setForm({ displayName: profile.displayName, username: profile.username, bio: profile.bio });
        setError('');
        setOpen(true);
    };
    const save = () => {
        const name = form.displayName.trim();
        const handle = form.username.trim().replace(/^@/, '');
        if (name.length < 2) {
            setError('Nama tampilan minimal 2 karakter.');
            return;
        }
        if (!/^[a-z0-9._]{3,20}$/i.test(handle)) {
            setError('Username: 3–20 karakter, huruf/angka/titik/garis bawah saja.');
            return;
        }
        update({ displayName: name, username: handle, bio: form.bio.trim() });
        setOpen(false);
        toast.success('Profil diperbarui', `@${handle}`);
    };
    return (<>
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="h-28 sm:h-36" style={{ backgroundImage: banner.css }} aria-hidden/>
        <div className="px-4 pb-4 sm:px-6">
          <div className="-mt-10 flex flex-wrap items-end gap-4">
            <Avatar avatarId={profile.avatarId} name={profile.displayName} size="xl" ring/>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold text-ink">{profile.displayName}</h2>
                <Badge tone="accent">Level {level.level}</Badge>
                <Badge tone="primary">@{profile.username}</Badge>
              </div>
              <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
                {profile.bio || 'Belum ada bio. Tambahkan supaya temanmu mengenalmu.'}
              </p>
            </div>
            <Button variant="outline" icon={<Pencil />} onClick={edit}>
              Edit profil
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3 text-[12.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5"/> Bergabung{' '}
              {new Date(profile.joinedAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })}
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <CalendarDays className="size-3.5"/> {level.total.toLocaleString('id-ID')} XP total
            </span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Check className="size-3.5"/> {level.into}/{level.needed} XP ke level berikutnya
            </span>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Edit profil" description="Perubahan disimpan di browser ini." size="md" footer={<>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" icon={<Check />} onClick={save}>
              Simpan perubahan
            </Button>
          </>}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama tampilan" required>
              <Input value={form.displayName} onChange={(e) => {
            setForm((f) => ({ ...f, displayName: e.target.value }));
            setError('');
        }}/>
            </Field>
            <Field label="Username" required hint="3–20 karakter">
              <Input value={form.username} onChange={(e) => {
            setForm((f) => ({ ...f, username: e.target.value }));
            setError('');
        }}/>
            </Field>
          </div>
          <Field label="Bio" hint={`${form.bio.length}/200 karakter`}>
            <Textarea rows={3} maxLength={200} value={form.bio} placeholder="Ceritakan sedikit tentang cara kamu belajar." onChange={(e) => {
            setForm((f) => ({ ...f, bio: e.target.value }));
            setError('');
        }}/>
          </Field>
          {error && <p className="text-[12.5px] text-danger">{error}</p>}
        </div>
      </Modal>
    </>);
}
