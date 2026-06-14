# SaaS Rental Mobil

> Platform SaaS multi-tenant untuk manajemen bisnis rental mobil di Indonesia.
> Backend API via Nuxt 4 / Nitro. Database via Postgres Supabase + Drizzle ORM.
> Frontend dikerjakan tim frontend (lihat `app/pages/` dan `app/components/`).

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Nuxt 4 + Nitro (server API) |
| **Database** | PostgreSQL 16 (Supabase) |
| **ORM** | Drizzle ORM (type-safe, source of truth di `server/db/schema.ts`) |
| **Auth** | Supabase Auth (JWT via `@nuxtjs/supabase`) |
| **Storage** | Supabase Storage (foto/dokumen armada, KTP/SIM) |
| **Frontend** | Nuxt UI 4 + Tailwind CSS v4 + Vue 3 (dikerjakan tim frontend) |
| **Testing** | belum ada |

Catatan penyimpangan dari `internal/docs/techstack.md`:
- Drizzle ORM digunakan sebagai **ORM utama** (menggantikan akses langsung Supabase client untuk query data). Supabase hanya untuk Auth + Storage.
- Redis, Drizzle ORM sebagai query builder (disebut di techstack) tetap dipakai — tapi koneksi via driver `postgres.js`, bukan pooler Supabase.
- Tidak ada DDL yang melalui Supabase client; semua DDL berasal dari Drizzle migrations + file SQL pelengkap.

## Prasyarat

- **Node.js** v22+ (tested: `v24.14.1`)
- **npm** (bun tidak diperlukan — meski techstack menyebut bun)
- **Supabase project** dengan kredensial di `.env`

## Setup Lokal

```bash
# 1. Clone & install
npm install

# 2. Salin env dan isi SUPABASE_DB_URL (password DB Supabase)
cp .env.example .env
# → edit SUPABASE_DB_URL

# 3. Jalankan migrasi database (DDL tabel + enum + index)
npm run db:migrate

# 4. (Opsional) seed data demo
npm run db:seed

# 5. Jalankan dev
npm run dev
# → http://localhost:3000
```

## Environment Variables

| Variable | Source | Wajib | Keterangan |
|----------|--------|-------|------------|
| `SUPABASE_URL` | Dashboard → Settings → API | Ya | Project URL |
| `SUPABASE_KEY` | Dashboard → Settings → API (anon/publishable) | Ya | Untuk client Supabase |
| `SUPABASE_SECRET_KEY` | Dashboard → Settings → API (service_role) | Ya | **Server only** — akses admin |
| `SUPABASE_DB_URL` | Dashboard → Database → Connection string (session pooler) | Ya | Koneksi Drizzle langsung ke Postgres |

## Migrasi Database

**Dua lapis migrasi:**

1. **Drizzle** (tabel/enum/index) — di-*generate* dari `server/db/schema.ts`:
   ```bash
   npm run db:generate  # hasil: supabase/migrations/NNNN_name.sql
   ```

2. **SQL pelengkap** (exclusion constraint, triggers, RLS, storage) — ditulis manual di:
   - `0001_extras.sql` — btree_gist, FK auth.users, overbooking exclusion
   - `0002_functions_triggers.sql` — helper tenant_id, set_updated_at, sinkron status
   - `0003_rls.sql` — Row Level Security semua tabel
   - `0004_storage.sql` — storage buckets + RLS berbasis path tenant

**Runner:** `scripts/migrate.mjs` — menjalankan semua `.sql` urut abjad, idempoten (tracking via `public._migrations`). Jalankan:

```bash
npm run db:migrate        # semua termasuk pelengkap
npm run db:migrate --seed # + data demo
```

## Multi-Tenant & Keamanan

- **Isolasi di kode:** Drizzle koneksi langsung sebagai DB owner (bypass RLS). Setiap query WAJIB filter `tenant_id` dari `event.context.auth` — ditegakkan oleh helper `findOwned()` dan pola `eq(table.tenant_id, ctx.tenantId)`.
- **RLS sebagai defense-in-depth:** Semua tabel punya policy tenant_id untuk melindungi akses via jalur non-Drizzle (mis. Supabase client langsung di frontend).
- **Role-based access:** Middleware mengisi `event.context.auth.role`. Guard `requireMinRole()` / `requireRole()` di handler. Owner: semua. Admin: operasional. Operator: terbatas. Viewer: read-only.

## Struktur Direktori

```
app/                         → Frontend (Nuxt UI)
  ├── assets/css/main.css    → Design token (dikerjakan tim frontend)
  ├── app.config.ts          → Runtime UI config
  ├── app.vue                → Root shell
  ├── layouts/               → Layout pages
  └── pages/                 → Halaman frontend

server/                      → Backend (Nitro API)
  ├── api/                   → Route handlers per domain
  │   ├── auth/              → auth/bootstrap
  │   ├── branches/          → CRUD + transfer
  │   ├── fleet/             → CRUD + status + maintenance + documents
  │   ├── customers/         → CRUD + rentals + blacklist
  │   ├── bookings/          → CRUD + status workflow + payment
  │   ├── whatsapp/          → Webhook stub
  │   ├── gps/               → Location stub
  │   ├── payments/          → Midtrans notify stub
  │   ├── reports/           → Summary
  │   └── health.get.ts      → Health check
  ├── db/                    → Drizzle schema + client
  │   ├── schema.ts          → Source of truth tabel/enum/index
  │   └── index.ts           → Client singleton
  ├── middleware/auth.ts      → Resolve user/sesi dari Supabase
  └── utils/                 → Helper: auth guard, pagination, booking, error, repo

shared/                      → Dipakai bersama server + frontend
  ├── constants/             → Enums + label/color mapping
  ├── types/                 → Model entity (mirip DB row)
  └── validators/            → Zod schemas (create/update/list query)

supabase/migrations/         → SQL migrasi (Drizzle + pelengkap)

scripts/migrate.mjs          → Runner migrasi idempoten
```

## Endpoint API (ringkasan)

| Method | Path | Role Min | Deskripsi |
|--------|------|----------|-----------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/bootstrap` | — | Buat tenant + profil setelah signup |
| GET | `/api/me` | auth | Profil + tenant saat ini |
| GET/PATCH | `/api/tenant` | admin | Detail/update tenant |
| GET/POST | `/api/branches` | admin | Daftar/tambah cabang |
| GET/PATCH/DELETE | `/api/branches/:id` | admin | Detail/update/hapus cabang |
| GET/POST | `/api/fleet` | admin | Daftar/tambah kendaraan |
| GET/PATCH/DELETE | `/api/fleet/:id` | admin | Detail/update/hapus kendaraan |
| PATCH | `/api/fleet/:id/status` | operator | Ubah status armada |
| POST | `/api/fleet/:id/maintenance` | admin | Jadwalkan servis |
| GET/POST | `/api/customers` | admin | Daftar/tambah pelanggan |
| GET/PATCH | `/api/customers/:id` | admin | Detail/update pelanggan |
| GET | `/api/customers/:id/rentals` | auth | Riwayat sewa pelanggan |
| POST | `/api/customers/:id/blacklist` | owner | Blacklist pelanggan |
| GET/POST | `/api/bookings` | operator | Daftar/tambah booking |
| GET/PATCH | `/api/bookings/:id` | operator | Detail/update booking |
| PATCH | `/api/bookings/:id/status` | operator | Ubah status booking |
| POST | `/api/bookings/:id/payment` | admin | Catat pembayaran |
| GET | `/api/reports/summary` | auth | Ringkasan dashboard |
| POST | `/api/whatsapp/webhook` | — | Stub webhook WA |
| POST | `/api/payments/midtrans/notify` | — | Stub Midtrans |
| POST | `/api/gps/ingest` | — | Stub ingress GPS |

## Lisensi

Hak cipta dilindungi. Proyek ini dikelola oleh **ai-builders.id**.
