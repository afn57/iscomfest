export const AVATARS = [
    { id: 'violet', label: 'Violet', bg: '#7c5cff', fg: '#ffffff' },
    { id: 'cyan', label: 'Cyan', bg: '#22d3ee', fg: '#05202a' },
    { id: 'mint', label: 'Mint', bg: '#34d399', fg: '#052e22' },
    { id: 'amber', label: 'Amber', bg: '#fbbf24', fg: '#3a2a00' },
    { id: 'rose', label: 'Rose', bg: '#f472b6', fg: '#3d0a24' },
    { id: 'blue', label: 'Blue', bg: '#5b8cff', fg: '#04122e' },
    { id: 'slate', label: 'Slate', bg: '#33415f', fg: '#e8ecf7' },
    { id: 'rocket', label: 'Rocket', bg: '#1c2740', fg: '#fbbf24', glyph: '🚀' },
    { id: 'brain', label: 'Deep Thinker', bg: '#161f33', fg: '#22d3ee', glyph: '🧠' },
    { id: 'owl', label: 'Night Owl', bg: '#111827', fg: '#c4b5fd', glyph: '🦉' },
    { id: 'leaf', label: 'Calm', bg: '#052e22', fg: '#6ee7b7', glyph: '🌿' },
    { id: 'flame', label: 'On Fire', bg: '#3a1d0a', fg: '#fb923c', glyph: '🔥' },
];
export const BANNERS = [
    { id: 'none', label: 'None', css: 'var(--surface-3)' },
    { id: 'midnight', label: 'Midnight', css: 'linear-gradient(120deg, #141b33 0%, #1c2740 60%, #24304d 100%)' },
    { id: 'violet-haze', label: 'Violet Haze', css: 'linear-gradient(120deg, #241a4d 0%, #3b2a86 55%, #7c5cff 140%)' },
    { id: 'ocean', label: 'Ocean', css: 'linear-gradient(120deg, #0b2536 0%, #0e4f5e 60%, #22d3ee 150%)' },
    { id: 'forest', label: 'Forest', css: 'linear-gradient(120deg, #0d2a1f 0%, #14532d 60%, #34d399 150%)' },
    { id: 'ember', label: 'Ember', css: 'linear-gradient(120deg, #2c1a0a 0%, #7c2d12 60%, #fbbf24 150%)' },
];
export const PROFILE_THEMES = [
    { id: 'electric', label: 'Electric Violet', accent: '#7c5cff', soft: 'rgba(124,92,255,0.16)' },
    { id: 'cyan-drive', label: 'Cyan Drive', accent: '#22d3ee', soft: 'rgba(34,211,238,0.16)' },
    { id: 'mint-calm', label: 'Mint Calm', accent: '#34d399', soft: 'rgba(52,211,153,0.16)' },
    { id: 'amber-glow', label: 'Amber Glow', accent: '#fbbf24', soft: 'rgba(251,191,36,0.16)' },
    { id: 'rose-fade', label: 'Rose Fade', accent: '#f472b6', soft: 'rgba(244,114,182,0.16)' },
    { id: 'ocean-blue', label: 'Ocean Blue', accent: '#5b8cff', soft: 'rgba(91,140,255,0.16)' },
];
export const BACKGROUNDS = [
    { id: 'plain', label: 'Plain', css: 'var(--page)' },
    {
        id: 'grid',
        label: 'Grid',
        css: 'radial-gradient(var(--line) 1px, transparent 1px), var(--page)',
    },
    {
        id: 'dots',
        label: 'Dots',
        css: 'radial-gradient(circle at 1px 1px, var(--line-strong) 1px, transparent 0), var(--page)',
    },
    {
        id: 'aurora',
        label: 'Aurora',
        css: 'radial-gradient(900px 420px at 12% -10%, var(--primary-soft), transparent 65%), radial-gradient(760px 380px at 88% 8%, var(--accent-soft), transparent 62%), var(--page)',
    },
    {
        id: 'spotlight',
        label: 'Spotlight',
        css: 'radial-gradient(680px 320px at 50% -6%, var(--primary-soft), transparent 70%), var(--page)',
    },
];
export const DEFAULT_PROFILE = {
    username: 'nabil.a',
    displayName: 'Nabil Ahmad',
    bio: 'Mahasiswa teknik yang sedang belajar konsisten. Satu tugas, satu sesi fokus, setiap hari.',
    avatarId: 'violet',
    bannerId: 'midnight',
    themeId: 'electric',
    backgroundId: 'aurora',
    joinedAt: '2025-08-14T09:00:00.000Z',
};
export const findAvatar = (id) => AVATARS.find((a) => a.id === id) ?? AVATARS[0];
export const findBanner = (id) => BANNERS.find((b) => b.id === id) ?? BANNERS[0];
export const findTheme = (id) => PROFILE_THEMES.find((t) => t.id === id) ?? PROFILE_THEMES[0];
export const findBackground = (id) => BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
