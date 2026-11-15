import { useState } from 'react';
import { Check, Palette, Pencil, User } from 'lucide-react';
import { AVATARS, BACKGROUNDS, BANNERS, PROFILE_THEMES, findBanner } from '../../data/mock/profile';
import { useProfileStore } from '../../store/useProfileStore';
import { toast } from '../../store/useToastStore';
import { Avatar, Badge, Button, Field, Input, Modal, Textarea } from '../common';
import { cn } from '../../utils/cn';
export function ProfileHeader() {
    const profile = useProfileStore((s) => s.profile);
    const update = useProfileStore((s) => s.update);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio,
        avatarId: profile.avatarId,
        themeId: profile.themeId,
        bannerId: profile.bannerId,
        backgroundId: profile.backgroundId,
    });
    const [error, setError] = useState('');
    const banner = findBanner(profile.bannerId);
    const edit = () => {
        setForm({
            displayName: profile.displayName,
            username: profile.username,
            bio: profile.bio,
            avatarId: profile.avatarId,
            themeId: profile.themeId,
            bannerId: profile.bannerId,
            backgroundId: profile.backgroundId,
        });
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
        update({
            displayName: name,
            username: handle,
            bio: form.bio.trim(),
            avatarId: form.avatarId,
            themeId: form.themeId,
            bannerId: form.bannerId,
            backgroundId: form.backgroundId,
        });
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

          <div className="border-t border-line pt-4">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <Palette className="size-4 text-primary"/> Tampilan
            </p>
            <p className="mt-0.5 text-[12px] text-ink-muted">
              Pilih avatar, warna aksen, banner, dan latar aplikasi kamu.
            </p>

            <div className="mt-4 space-y-4">
              <Field label="Avatar">
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map((a) => (<button key={a.id} type="button" onClick={() => setForm((f) => ({ ...f, avatarId: a.id }))} aria-label={`Avatar ${a.label}`} title={a.label} className={cn('rounded-full p-0.5 transition-all', form.avatarId === a.id
                    ? 'ring-2 ring-primary'
                    : 'ring-1 ring-line hover:ring-line-strong')}>
                    <Avatar avatarId={a.id} name={form.displayName} size="sm"/>
                  </button>))}
                </div>
              </Field>

              <Field label="Warna aksen">
                <div className="flex flex-wrap gap-2">
                  {PROFILE_THEMES.map((t) => (<button key={t.id} type="button" onClick={() => setForm((f) => ({ ...f, themeId: t.id }))} className={cn('inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors', form.themeId === t.id
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line bg-surface-2 text-ink-muted hover:border-line-strong hover:text-ink-soft')}>
                    <span className="size-3.5 shrink-0 rounded-full" style={{ background: t.accent }}/>
                    {t.label}
                  </button>))}
                </div>
              </Field>

              <Field label="Banner profil">
                <div className="flex flex-wrap gap-2">
                  {BANNERS.map((b) => (<button key={b.id} type="button" onClick={() => setForm((f) => ({ ...f, bannerId: b.id }))} aria-label={`Banner ${b.label}`} title={b.label} style={{ background: b.css }} className={cn('h-9 w-16 shrink-0 rounded-lg border transition-all', form.bannerId === b.id
                    ? 'border-primary ring-2 ring-primary/50'
                    : 'border-line hover:border-line-strong')}/>))}
                </div>
              </Field>

              <Field label="Latar aplikasi">
                <div className="flex flex-wrap gap-2">
                  {BACKGROUNDS.map((b) => (<button key={b.id} type="button" onClick={() => setForm((f) => ({ ...f, backgroundId: b.id }))} aria-label={`Latar ${b.label}`} title={b.label} style={{ background: b.css }} className={cn('h-9 w-16 shrink-0 rounded-lg border transition-all', form.backgroundId === b.id
                    ? 'border-primary ring-2 ring-primary/50'
                    : 'border-line hover:border-line-strong')}/>))}
                </div>
              </Field>
            </div>
          </div>

          {error && <p className="text-[12.5px] text-danger">{error}</p>}
        </div>
      </Modal>
    </>);
}
