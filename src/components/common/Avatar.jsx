import { cn } from '../../utils/cn';
import { findAvatar } from '../../data/mock/profile';
import { initials } from '../../utils/format';
const SIZES = {
    xs: 'size-7 text-[11px]',
    sm: 'size-9 text-[13px]',
    md: 'size-11 text-sm',
    lg: 'size-16 text-lg',
    xl: 'size-24 text-2xl',
};
export function Avatar({ avatarId, name, size = 'md', ring, className }) {
    const preset = findAvatar(avatarId);
    return (<div className={cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold', SIZES[size], ring && 'ring-2 ring-primary/40 ring-offset-2 ring-offset-surface', className)} style={{ backgroundColor: preset.bg, color: preset.fg }} aria-label={name}>
      {preset.glyph ? (<span className="leading-none">{preset.glyph}</span>) : (<span className="leading-none">{initials(name)}</span>)}
    </div>);
}
