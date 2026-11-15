import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel = 'Konfirmasi', cancelLabel = 'Batal', tone = 'default', loading, children, }) {
    return (<Modal open={open} onClose={onClose} title={<span className="inline-flex items-center gap-2">
          {tone !== 'default' && (<AlertTriangle className={tone === 'danger' ? 'size-4 text-danger' : 'size-4 text-success'}/>)}
          {title}
        </span>} size="sm" footer={<>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>}>
      <div className="text-sm text-ink-soft leading-relaxed">{body}</div>
      {children}
    </Modal>);
}
