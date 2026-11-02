import { useState } from 'react'
import { ImagePlus, Send } from 'lucide-react'
import { POST_CATEGORIES } from '../../data/mock/social'
import { useCommunityStore } from '../../store/useCommunityStore'
import { toast } from '../../store/useToastStore'
import { Avatar, Button, Field, Input, Panel, Select, Textarea } from '../common'

export function PostComposer() {
  const addPost = useCommunityStore((s) => s.addPost)
  const [category, setCategory] = useState<string>('Study Tips')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = () => {
    if (title.trim().length < 6) {
      setError('Judul minimal 6 karakter.')
      return
    }
    if (body.trim().length < 20) {
      setError('Tulis setidaknya 20 karakter agar bermanfaat untuk yang lain.')
      return
    }
    setError('')
    setBusy(true)
    window.setTimeout(() => {
      addPost({ category, title, body, authorId: 'self' })
      setTitle('')
      setBody('')
      setBusy(false)
      toast.success('Postingan dibagikan', 'Teman-temanmu bisa melihatnya di feed.')
    }, 260)
  }

  return (
    <Panel title="Bagikan ke komunitas" description="Tips, pertanyaan, atau kemenangan kecilmu hari ini.">
      <div className="flex items-start gap-3">
        <Avatar avatarId="violet" name="Kamu" size="sm" />
        <div className="min-w-0 flex-1">
          <Field label="Judul" required error={error && title.trim().length < 6 ? error : undefined}>
            <Input
              value={title}
              placeholder="Mis. Cara saya menjaga fokus saat jam kelas panjang"
              onChange={(e) => {
                setTitle(e.target.value)
                setError('')
              }}
            />
          </Field>

          <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Field label="Kategori">
              <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                {POST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <span className="hidden items-center gap-1.5 pb-2.5 text-[12px] text-ink-muted sm:flex">
              <ImagePlus className="size-3.5" /> Lampiran gambar: simulasi saja
            </span>
          </div>

          <div className="mt-3">
            <Field label="Isi postingan" required>
              <Textarea
                rows={4}
                value={body}
                placeholder="Ceritakan pendekatanmu, hasilnya, atau pertanyaan yang sedang kamu pikirkan."
                onChange={(e) => {
                  setBody(e.target.value)
                  setError('')
                }}
              />
            </Field>
          </div>

          {error && title.trim().length >= 6 && (
            <p className="mt-1.5 text-[12px] text-danger">{error}</p>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="hidden text-[12px] text-ink-muted sm:block">
              Data disimpan lokal di browser kamu.
            </p>
            <Button variant="primary" icon={<Send />} loading={busy} onClick={submit}>
              Bagikan
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  )
}
