/** Normalisasi input pengguna menjadi domain bersih, mis. "https://www.x.com/a" → "x.com". */
export function normalizeHost(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
}
