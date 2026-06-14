# Design System — Aplikasi Tracking Mobil Rental (Rajawali Rentcar)

## Based on Nuxt UI 4 + Tailwind CSS v4

---

## 1. Design Philosophy

- **Professional & Trustworthy** — Clean, organized, data-rich interfaces
- **Mobile-First** — Owner accesses dashboard from phone (bottom nav)
- **Data-Dense** — Fleet status, revenue, utilization at a glance
- **Dark Mode Ready** — Reduce eye strain for long operational hours
- **Indonesian Context** — Warm, approachable color palette

## 2. Design Tokens yang Sudah Diimplementasikan

Semua token ada di `app/assets/css/main.css`. Berikut ringkasan:

### Variabel CSS Kustom (bukan Tailwind utility — digunakan langsung di komponen)

```
--bg              #F4F6FA    (dark: #080C14)
--bg-elev         #FFFFFF    (dark: #0F1726)
--bg-subtle       #EDF1F7    (dark: #141E30)
--bg-hover        #F1F4F9    (dark: #18243B)
--border          #E5EAF1    (dark: #1E2A3F)
--border-strong   #D6DEE9    (dark: #2B3A53)
--text            #15202E    (dark: #E8EDF4)
--text-muted      #5B6B7F    (dark: #93A2B8)
--text-faint      #8896A8    (dark: #62748C)

--primary         #0A74D1    (dark: #38BDF8)
--primary-strong  #0860B0    (dark: #7DD3FC)
--primary-soft    #E6F1FC    (dark: #0C2A41)
--accent          #D9870B    (dark: #FBBF24)
```

### Fleet Status Colors (Tailwind `@theme` + CSS variables)

| Status | Hex Light | Hex Dark |
|--------|-----------|----------|
| AVAILABLE | `#16A34A` | `#34D399` |
| BOOKED | `#2563EB` | `#60A5FA` |
| ON_RENT | `#D97706` | `#FBBF24` |
| MAINTENANCE | `#DC2626` | `#F87171` |
| INSPECTION | `#64748B` | `#94A3B8` |

### Design Tokens Lain

```
--r-card: 13px, --r-md: 9px, --r-sm: 7px, --pill: 999px
--shadow-sm, --shadow-card, --shadow-pop
--sidebar-w: 248px, --sidebar-cw: 72px, --topbar-h: 60px
```

### Font
```css
--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
```

## 3. Layout

### Dashboard Layout (default.vue)
```
┌───────┬─────────────────────────────────────┐
│       │            Topbar                    │
│Sidebar│  Page title | User menu | Notif     │
│       ├─────────────────────────────────────┤
│ 248px │                                     │
│       │          Page Content                │
│(72px  │  Stat cards → Fleet grid → Tables   │
│coll.) │                                     │
└───────┴─────────────────────────────────────┘
```

### Mobile (< md)
- Sidebar tersembunyi
- Bottom navigation (🏠 🚗 📅 👤)
- Overlay saat hamburger

## 4. Komponen yang Diimplementasikan

| Komponen | File | Fungsi |
|----------|------|--------|
| AppSidebar | `components/AppSidebar.vue` | Navigasi utama, brand, plan card, collapsed/expanded |
| AppTopbar | `components/AppTopbar.vue` | Title, breadcrumb, user menu |
| StatCard | `components/StatCard.vue` | Kartu ringkasan dengan icon |
| RBadge | `components/RBadge.vue` | Status badge berwarna (fleet/customer) |
| RButton | `components/RButton.vue` | Tombol kustom |
| RCard | `components/RCard.vue` | Card container |
| RIcon | `components/RIcon.vue` | Icon wrapper |
| RAvatar | `components/RAvatar.vue` | Avatar user |
| StatusBadge | `components/StatusBadge.vue` | Badge spesifik untuk status fleet |
| Segmented | `components/Segmented.vue` | Segmented control (filter) |
| Sparkline | `components/Sparkline.vue` | Mini chart |
| BarChart | `components/BarChart.vue` | Bar chart |
| Donut | `components/Donut.vue` | Donut chart |
| PhotoSlot | `components/PhotoSlot.vue` | Foto kendaraan area |
| Rating | `components/Rating.vue` | Rating pelanggan |
| MobileNav | `components/MobileNav.vue` | Bottom nav mobile |

## 5. Halaman Frontend

| Route | File | Status |
|-------|------|--------|
| `/` | `pages/index.vue` | Landing / login |
| `/login` | `pages/login.vue` | Login |
| `/register` | `pages/register.vue` | Register |
| `/dashboard` | `pages/dashboard.vue` | Dashboard utama |
| `/fleet` | `pages/fleet/index.vue` | Daftar armada |
| `/fleet/:id` | `pages/fleet/[id].vue` | Detail kendaraan |
| `/customers` | `pages/customers/index.vue` | Daftar pelanggan |
| `/customers/:id` | `pages/customers/[id].vue` | Detail pelanggan |
| `/bookings` | `pages/bookings.vue` | Kalender booking |
| `/gps` | `pages/gps.vue` | Live map (stub) |
| `/reports` | `pages/reports.vue` | Laporan |
| `/settings` | `pages/settings.vue` | Pengaturan tenant |

## 6. Sidebar Nav Sections

```
Utama
  🏠 Dashboard
  🚗 Fleet
  👥 Customers

Transaksi & Bisnis
  📅 Bookings
  🗺️ GPS Live
  📊 Reports

Pengaturan
  ⚙️ Settings
```

## 7. Dark Mode

- `@nuxtjs/color-mode` (bundled dengan Nuxt UI 4)
- Class `.dark` toggle pada `<html>` (via `colorMode.classSuffix: ''`)
- Persisted di localStorage (`rr-theme`)
- Options: Light | Dark | System
- Semua komponen punya varian dark via CSS variables (lihat §2)

## 8. Responsive Breakpoints

| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Wide desktop |
| `2xl` | 1536px | Large screens |
