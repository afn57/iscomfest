/** Merge conditional class names into a single string. */
export function cn(...parts) {
    return parts.filter(Boolean).join(' ');
}
