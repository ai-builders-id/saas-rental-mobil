export type SearchResultType = 'fleet' | 'customer' | 'booking' | 'page'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle: string
  href: string
  icon: string
}

const PAGES: SearchResult[] = [
  { id: 'page-dashboard', type: 'page', title: 'Dashboard', subtitle: 'Ringkasan armada & pendapatan', href: '/dashboard', icon: 'layout-dashboard' },
  { id: 'page-fleet', type: 'page', title: 'Armada', subtitle: 'Daftar kendaraan rental', href: '/fleet', icon: 'car-front' },
  { id: 'page-bookings', type: 'page', title: 'Booking', subtitle: 'Kalender & jadwal sewa', href: '/bookings', icon: 'calendar-days' },
  { id: 'page-customers', type: 'page', title: 'Pelanggan', subtitle: 'Database pelanggan', href: '/customers', icon: 'users' },
  { id: 'page-gps', type: 'page', title: 'GPS Tracking', subtitle: 'Peta live unit armada', href: '/gps', icon: 'map-pin' },
  { id: 'page-reports', type: 'page', title: 'Laporan', subtitle: 'Analitik & laporan bisnis', href: '/reports', icon: 'chart-column' },
  { id: 'page-settings', type: 'page', title: 'Pengaturan', subtitle: 'Profil bisnis & langganan', href: '/settings', icon: 'settings' },
]

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}

function matches(q: string, ...parts: (string | null | undefined)[]) {
  const needle = norm(q)
  if (!needle) return true
  return parts.some((p) => p && norm(p).includes(needle))
}

export function useGlobalSearch() {
  const open = useState('globalSearchOpen', () => false)
  const query = useState('globalSearchQuery', () => '')
  const { vehicles, customers, activeRentals, init, fetched } = useRentalData()

  const results = computed<SearchResult[]>(() => {
    const q = query.value.trim()
    if (!q) return PAGES.slice(0, 5)

    const out: SearchResult[] = []

    for (const v of vehicles.value) {
      if (!matches(q, v.plate, v.merk, v.model, `${v.merk} ${v.model}`)) continue
      out.push({
        id: `fleet-${v.id}`,
        type: 'fleet',
        title: v.plate,
        subtitle: `${v.merk} ${v.model} · ${v.branch || 'Armada'}`,
        href: `/fleet/${v.id}`,
        icon: 'car-front',
      })
    }

    for (const c of customers.value) {
      if (!matches(q, c.name, c.phone, c.city)) continue
      out.push({
        id: `cust-${c.id}`,
        type: 'customer',
        title: c.name,
        subtitle: `${c.phone} · ${c.city}`,
        href: `/customers/${c.id}`,
        icon: 'user',
      })
    }

    for (const r of activeRentals.value) {
      if (!matches(q, r.plate, r.vehicle, r.customer)) continue
      out.push({
        id: `rent-${r.id}`,
        type: 'booking',
        title: r.plate,
        subtitle: `${r.vehicle} · ${r.customer} · ${r.due}`,
        href: '/bookings',
        icon: 'calendar-days',
      })
    }

    for (const p of PAGES) {
      if (!matches(q, p.title, p.subtitle)) continue
      out.push(p)
    }

    return out.slice(0, 12)
  })

  function openSearch() {
    if (!fetched.value) init()
    open.value = true
    query.value = ''
  }

  function closeSearch() {
    open.value = false
    query.value = ''
  }

  async function goTo(result: SearchResult) {
    closeSearch()
    await navigateTo(result.href)
  }

  return { open, query, results, openSearch, closeSearch, goTo }
}
