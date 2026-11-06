import { Aperture, BadgeCheck, Brain, Circle, Palette, Rocket, Sparkles, Type, } from 'lucide-react';
/**
 * Brand marks for restricted apps.
 *
 * lucide-react removed brand icons, so FOCUSLY ships its own lightweight
 * geometric glyphs. These are decorative stand-ins, not official logos.
 */
const BRAND_PATHS = {
    instagram: [
        { viewBox: '0 0 24 24', d: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z', fill: false },
        { viewBox: '0 0 24 24', d: 'M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z', fill: true },
        { viewBox: '0 0 24 24', d: 'M17.4 6.6h.01', fill: false },
    ],
    tiktok: [
        { viewBox: '0 0 24 24', d: 'M14 4v9.6a3.4 3.4 0 1 1-3.4-3.4', fill: false },
        { viewBox: '0 0 24 24', d: 'M14 4c.6 2.6 2.4 4.2 5 4.6', fill: false },
    ],
    youtube: [
        { viewBox: '0 0 24 24', d: 'M3 8.5A3.5 3.5 0 0 1 6.5 5h11A3.5 3.5 0 0 1 21 8.5v7a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 3 15.5v-7Z', fill: false },
        { viewBox: '0 0 24 24', d: 'M10.5 9.2v5.6L15.5 12l-5-2.8Z', fill: true },
    ],
    facebook: [
        { viewBox: '0 0 24 24', d: 'M14.5 8.5h2V5.6h-2.2c-2 0-3.3 1.3-3.3 3.4v1.6H9v2.9h2v6.5h3v-6.5h2.2l.4-2.9H14V9.3c0-.5.2-.8.5-.8Z', fill: true },
    ],
    x: [
        { viewBox: '0 0 24 24', d: 'M5 5l14 14M19 5 5 19', fill: false },
    ],
    reddit: [
        { viewBox: '0 0 24 24', d: 'M12 8.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z', fill: true },
        { viewBox: '0 0 24 24', d: 'M4.5 13.5c0-3 3.4-5.4 7.5-5.4s7.5 2.4 7.5 5.4c0 2.6-3 4.6-7.5 4.6s-7.5-2-7.5-4.6Z', fill: false },
        { viewBox: '0 0 24 24', d: 'M14.5 6.5 16 4.8M8.5 6.5 7 4.8', fill: false },
        { viewBox: '0 0 24 24', d: 'M9 15.5c1.8 1.2 4.2 1.2 6 0', fill: false },
    ],
};
const CUSTOM_ICON = {
    theme: Palette,
    avatar: Rocket,
    badge: BadgeCheck,
    frame: Aperture,
    background: Sparkles,
};
export function BrandIcon({ name, className, size = 16 }) {
    const key = name.toLowerCase();
    if (BRAND_PATHS[key]) {
        return (<svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {BRAND_PATHS[key].map((seg, i) => (<path key={i} d={seg.d} fill={seg.fill ? 'currentColor' : 'none'} stroke={seg.fill ? 'none' : 'currentColor'}/>))}
      </svg>);
    }
    const Glyph = CUSTOM_ICON[key] ??
        (key === 'circle' ? Circle : key === 'type' ? Type : Brain);
    return <Glyph className={className ?? ''} size={size} aria-hidden/>;
}
