import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
const SIZES = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};
export function Modal({ open, onClose, title, description, children, footer, size = 'md', closeOnBackdrop = true, className, }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);
    if (!open)
        return null;
    return createPortal(<div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center sm:p-6">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] animate-[fade-up_0.18s_ease-out]" onClick={closeOnBackdrop ? onClose : undefined} aria-hidden/>
      <div role="dialog" aria-modal="true" className={cn('relative w-full rounded-card border border-line bg-surface shadow-pop animate-pop', 'max-h-[90vh] overflow-y-auto', SIZES[size], className)}>
        {(title || description) && (<header className="flex items-start justify-between gap-4 border-b border-line px-5 pt-4 pb-3">
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold text-ink font-display">{title}</h2>}
              {description && (<p className="mt-1 text-[13px] text-ink-muted leading-snug">{description}</p>)}
            </div>
            <button type="button" onClick={onClose} aria-label="Tutup dialog" className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink">
              <X className="size-4"/>
            </button>
          </header>)}
        <div className="px-5 pt-3 pb-4">{children}</div>
        {footer && (<footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4">
            {footer}
          </footer>)}
      </div>
    </div>, document.body);
}
