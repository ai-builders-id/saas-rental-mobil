# Tech Stack — Aplikasi Tracking Mobil Rental

---

## 1. Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Nuxt** | 4.4.8 | SSR/SSG framework, file-based routing, auto-imports |
| **Vue** | 3.5.x | UI framework (bundled with Nuxt) |
| **Nuxt UI** | 4.8.2 | Component library (125+ components, MIT) |
| **Tailwind CSS** | v4 | Utility-first CSS, `@theme` directive |
| **TypeScript** | 5.7 | Type safety |
| **VueUse** | latest | Composables library |
| **Zod** | 4.4.3 | Runtime validation (shared with server) |

### Nuxt 4 Configuration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxtjs/supabase'],
  compatibilityVersion: 4,
  css: ['~/assets/css/main.css'],
  routeRules: { '/api/**': { cors: true } },
})
```

### Directory Structure
```
app/
├── assets/css/main.css       # Tailwind + Nuxt UI + design tokens (Rajawali Rentcar)
├── components/               # 17 custom komponen (AppSidebar, AppTopbar, StatCard, RBadge, …)
├── composables/              # useRentalData (data + state management)
├── layouts/                  # default.vue (dashboard), auth.vue (login/register)
├── pages/                    # 13 halaman (dashboard, fleet, customers, bookings, gps, reports, settings, login, register)
├── app.config.ts             # Runtime config
└── app.vue                   # Root component

server/
├── api/                      # 25 endpoint handler (5 domain: auth, branches, fleet, customers, bookings + stubs)
├── middleware/auth.ts        # Auth middleware (resolve Supabase JWT → event.context)
├── db/                       # Drizzle ORM: schema.ts + client singleton (postgres.js)
└── utils/                    # errors, pagination, booking, repo, auth guards

shared/
├── types/                    # TypeScript types (selaras DB snake_case)
├── validators/               # Zod schemas per resource
└── constants/                # Enums + labels/colors Indonesia
```

---

## 2. Backend & API

| Technology | Purpose |
|-----------|---------|
| **Nitro** (Nuxt 4 built-in) | Server engine — handles API routes, middleware, SSR |
| **Supabase** (Auth + Postgres + Storage) | Authentication, database hosting, file storage |
| **Drizzle ORM** | TypeScript-first SQL ORM (type-safe, lightweight) |
| **postgres.js** | Driver koneksi langsung ke Postgres |

> **Penyimpangan dari rancangan awal:**
> - ~~Drizzle sebagai ORM saja~~ → ✅ Drizzle sebagai **source of truth** schema + query builder
> - ~~Redis 7~~ → ❌ Belum diimplementasikan (post-MVP)
> - ~~PostgreSQL self-hosted~~ → ✅ Supabase Postgres managed
> - ~~JWT custom~~ → ✅ Supabase Auth (JWT via `@nuxtjs/supabase`)
> - ~~Redis queue (BullMQ)~~ → ❌ Belum diimplementasikan (post-MVP)

---

## 3. External Services

| Service | Purpose | Status |
|---------|---------|--------|
| **Midtrans** | Payment gateway (QRIS, VA, e-wallet, CC) | 🟡 Stub |
| **Xendit** | Backup payment gateway | ❌ Belum |
| **WhatsApp Business API** | Chatbot, notifications | 🟡 Stub |
| **GPS Provider API** | Real-time vehicle tracking | 🟡 Stub |
| **Supabase Storage** | File storage (KTP, SIM, photos) | ✅ Siap (bucket + RLS) |
| **Sentry** | Error tracking & monitoring | ❌ Belum |
| **Google Maps** | Map display, geocoding | ❌ Belum |

---

## 4. DevOps & Infrastructure

| Tool | Purpose | Status |
|------|---------|--------|
| **Supabase Cloud** | Database hosting + Auth + Storage | ✅ Used |
| **Cloudflare VPS** | Hosting | ❌ Belum |
| **Cloudflare Tunnel** | Secure ingress | ❌ Belum |
| **Docker** | Containerization | ❌ Belum |
| **GitHub Actions** | CI/CD | ❌ Belum |

---

## 5. Development Tools

| Tool | Purpose |
|------|---------|
| **Node.js** v24.14.1 | JavaScript runtime (npm, bukan bun) |
| **VS Code** | Primary editor |
| **Vue DevTools** | Vue/Nuxt debugging |
| **Postgres / Supabase Studio** | Database management |

---

## 6. Key Libraries

| Package | Purpose | Tercatat? |
|---------|---------|-----------|
| `@nuxt/ui` 4.8.2 | UI components + design system | ✅ |
| `@nuxtjs/supabase` 2.0.9 | Supabase Auth + client integration | ✅ |
| `drizzle-orm` 0.45.2 | Database ORM | ✅ |
| `drizzle-kit` 0.31.10 | Migration tool | ✅ |
| `zod` 4.4.3 | Schema validation (shared) | ✅ |
| `postgres` 3.4.5 | Database driver | ✅ (baru) |
| `date-fns` 4.4.0 | Date manipulation | ✅ |
| `@vueuse/core` | Belum dipasang | ❌ (post-MVP) |
| `midtrans-client` | Belum dipasang | ❌ (post-MVP) |
| `socket.io` | Belum dipasang | ❌ (post-MVP) |
| `bullmq` | Belum dipasang | ❌ (post-MVP) |

---

## 7. Perubahan dari Rencana Awal

| Keputusan | Rencana Awal | Realita | Alasan |
|-----------|-------------|---------|--------|
| **ORM** | Drizzle hanya query builder | Drizzle = source of truth schema | User minta ORM penuh |
| **Auth** | JWT custom + bcrypt | Supabase Auth (JWT via `@nuxtjs/supabase`) | User beri kredensial Supabase |
| **Database** | PostgreSQL 16 self-hosted | Supabase Postgres managed | Instruksi user |
| **Storage** | Cloudflare R2 + S3 API | Supabase Storage | Sederhana untuk MVP |
| **Runtime** | Bun | npm (Node.js) | Bun tidak terpasang |
| **Caching** | Redis 7 | Belum ada | Post-MVP |
| **WA Queue** | BullMQ | Stub | Post-MVP |
