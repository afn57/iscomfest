import { useState } from 'react'
import { Globe, Lock, Plus, Trash2, X } from 'lucide-react'
import { Badge, Button, Input, Panel } from '../common'
import { BrandIcon } from '../common/BrandIcon'
import { selectAllApps, useFocusStore } from '../../store/useFocusStore'
import { cn } from '../../utils/cn'
import { toast } from '../../store/useToastStore'

export function RestrictedApps() {
  const selected = useFocusStore((s) => s.selectedAppIds)
  const toggleApp = useFocusStore((s) => s.toggleApp)
  const customApps = useFocusStore((s) => s.customApps)
  const addCustomApp = useFocusStore((s) => s.addCustomApp)
  const removeCustomApp = useFocusStore((s) => s.removeCustomApp)
  const setApps = useFocusStore((s) => s.setApps)

  const [name, setName] = useState('')
  const [host, setHost] = useState('')

  const apps = selectAllApps({ customApps })

  const submitCustom = () => {
    const cleanHost = host.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (name.trim().length < 2 || !cleanHost.includes('.')) {
      toast.error('Data belum lengkap', 'Isi nama dan domain yang valid, mis. chatgpt.com.')
      return
    }
    addCustomApp(name.trim(), cleanHost)
    setName('')
    setHost('')
    toast.success('Website ditambahkan', `${cleanHost} masuk daftar pembatasan (simulasi).`)
  }

  return (
    <Panel
      title="Aplikasi & website yang dibatasi"
      description="Pilih yang ingin dijauhi selama sesi fokus. Ini simulasi — pemblokiran nyata butuh extension atau aplikasi native."
      action={
        selected.length > 0 ? (
          <button
            type="button"
            onClick={() => setApps([])}
            className="text-[12px] font-medium text-danger hover:underline"
          >
            Kosongkan
          </button>
        ) : null
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {apps.map((app) => {
          const active = selected.includes(app.id)
          return (
            <div
              key={app.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                active ? 'border-primary/40 bg-primary-soft' : 'border-line bg-surface-2',
              )}
            >
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  active ? 'bg-primary/20 text-primary' : 'bg-surface-3 text-ink-muted',
                )}
              >
                <BrandIcon name={app.kind === 'custom' ? 'globe' : app.id} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">{app.name}</span>
                <span className="block truncate text-[11.5px] text-ink-muted">{app.host}</span>
              </span>

              {app.kind === 'custom' ? (
                <button
                  type="button"
                  onClick={() => removeCustomApp(app.id)}
                  aria-label={`Hapus ${app.name}`}
                  className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="size-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  aria-label={`Batasi ${app.name}`}
                  onClick={() => toggleApp(app.id)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors',
                    active ? 'bg-primary border-primary' : 'bg-surface-3 border-line-strong',
                  )}
                >
                  <span
                    className={cn(
                      'inline-block size-3.5 transform rounded-full bg-white transition-transform',
                      active ? 'translate-x-4.5' : 'translate-x-1',
                    )}
                  />
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-line-strong bg-surface-2 p-3.5">
        <div className="mb-2.5 flex items-center gap-2 text-[12.5px] font-medium text-ink-soft">
          <Globe className="size-3.5" /> Tambah website custom
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama, contoh: ChatGPT"
            className="h-9"
            maxLength={30}
          />
          <Input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="domain.com"
            className="h-9 sm:max-w-[12rem]"
            maxLength={60}
          />
          <Button size="sm" variant="secondary" icon={<Plus />} onClick={submitCustom}>
            Tambah
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone={selected.length > 0 ? 'primary' : 'neutral'} icon={<Lock className="size-3" />}>
          {selected.length} dipilih
        </Badge>
        {selected.length > 0 && (
          <span className="inline-flex flex-wrap gap-1.5">
            {apps
              .filter((a) => selected.includes(a.id))
              .map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1 rounded-full bg-surface-3 py-0.5 pl-2.5 pr-1.5 text-[11px] text-ink-soft"
                >
                  {a.name}
                  <button
                    type="button"
                    onClick={() => toggleApp(a.id)}
                    aria-label={`Lepas ${a.name}`}
                    className="rounded-full p-0.5 hover:text-danger"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
          </span>
        )}
      </div>
    </Panel>
  )
}
