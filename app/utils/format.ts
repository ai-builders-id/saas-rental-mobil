// Formatting helpers for the Rajawali Rentcar dashboard.
// Ported from internal/design/app/data.js (rupiah()).

export interface RupiahOptions {
  /** Compact form: "Rp 45.2 jt", "Rp 1.2 M", "Rp 315rb". */
  short?: boolean
}

export function rupiah(n: number, opts: RupiahOptions = {}): string {
  if (opts.short) {
    if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(1).replace('.0', '') + ' M'
    if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(1).replace('.0', '') + ' jt'
    if (n >= 1e3) return 'Rp ' + Math.round(n / 1e3) + 'rb'
  }
  return 'Rp ' + n.toLocaleString('id-ID')
}

/** Initials from a name, e.g. "Andi Wijaya" -> "AW". */
export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

/** Deterministic avatar background color derived from a name. */
const AVATAR_HUES = ['#0284C7', '#7C3AED', '#0F766E', '#B45309', '#BE185D', '#4338CA']
export function avatarHue(name: string): string {
  return AVATAR_HUES[name.charCodeAt(0) % AVATAR_HUES.length]
}
