let counter = 0

/** Small collision-resistant id generator (no backend, no crypto dependency). */
export function uid(prefix = 'id'): string {
  counter = (counter + 1) % 10_000
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`
}
