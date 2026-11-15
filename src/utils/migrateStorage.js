const LEGACY_KEYS = [
    'focusly_tasks',
    'focusly_calendar',
    'focusly_focus',
    'focusly_notifications',
    'focusly_profile',
    'focusly_progress',
    'focusly_settings',
    'focusly_task_view',
];
try {
    for (const oldKey of LEGACY_KEYS) {
        const raw = localStorage.getItem(oldKey);
        if (raw === null)
            continue;
        const newKey = 'flowstate_' + oldKey.slice('focusly_'.length);
        if (localStorage.getItem(newKey) === null)
            localStorage.setItem(newKey, raw);
        localStorage.removeItem(oldKey);
    }
}
catch {
    /* storage unavailable — the app falls back to seeded defaults */
}