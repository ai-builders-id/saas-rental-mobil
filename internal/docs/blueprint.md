# Blueprint — Aplikasi Tracking Mobil Rental

## 1. System Overview

Platform SaaS multi-tenant untuk bisnis rental mobil di Indonesia. Satu platform terpusat yang melayani banyak bisnis rental (tenant), masing-masing dengan data terisolasi.

**Core Capabilities (MVP):**
- Fleet management (CRUD + status: available/booked/on_rent/maintenance/inspection)
- Multi-cabang management
- Booking & reservation manual (via dashboard)
- Customer management + blacklist
- Payment stub (siap integrasi Midtrans nanti)
- GPS tracking stub
- Multi-tenant row-level isolation via Drizzle

---

## 2. Architecture

### High-Level Architecture

```
[Nuxt 4 (SSR) — Frontend + API Server (Nitro)]
    ├── Supabase Auth — JWT Authentication
    ├── Supabase Postgres — Database (managed)
    ├── Supabase Storage — File (KTP, SIM, foto mobil)
    └── Drizzle ORM — Type-safe queries + migrations

[External Services (stub)]
    ├── Midtrans/Xendit — Payment Gateway (🟡 stub)
    ├── WhatsApp Business API — Chatbot Booking (🟡 stub)
    └── GPS Provider API — Fleet Tracking (🟡 stub)
```

### Architecture Pattern

**Monolith-first with modular boundaries.** Nuxt 4 + Nitro server handles both frontend and API. Separated into domain modules:

```
app/
├── assets/css/main.css       # Design tokens custom (Rajawali Rentcar)
├── components/               # 17 shared UI components
├── composables/              # useRentalData (data fetching + state)
├── layouts/                  # default.vue (dashboard), auth.vue (login/register)
├── pages/                    # 13 halaman frontend
├── app.config.ts             # Runtime config
└── app.vue                   # Root component

server/
├── api/                      # 25 endpoint handler
│   ├── auth/                 # bootstrap (buat tenant + profil setelah signup)
│   ├── tenant/               # detail & update profil bisnis
│   ├── branches/             # CRUD + transfer (POST /api/branches/:id/transfer)
│   ├── fleet/                # CRUD + status + maintenance + documents
│   ├── customers/            # CRUD + rentals + blacklist
│   ├── bookings/             # CRUD + status workflow + payment
│   ├── whatsapp/             # Webhook stub
│   ├── gps/                  # Location stub
│   ├── payments/             # Midtrans notify stub
│   └── reports/              # Summary dashboard
├── middleware/auth.ts         # Server middleware (resolve Supabase JWT → tenant_id + role)
├── db/                       # Drizzle ORM schema + client
└── utils/                    # Helper: errors, pagination, booking price, auth guards

shared/                       # Isomorphic code (dipakai server + frontend)
├── types/                    # TypeScript types
├── validators/               # Zod validation schemas
└── constants/                # Shared constants (enums, labels Indonesia, tier info)
```

---

## 3. Data Model

### Core Entities

```
Tenant (Bisnis Rental)
├── Branches (Cabang)
│   ├── Vehicles (Mobil)
│   │   ├── VehicleDocuments (STNK, BPKB, asuransi)
│   │   └── MaintenanceRecords
│   └── Staff (via profiles dengan role)
├── Customers
│   └── Bookings
│       └── Payments
└── Subscriptions (via kolom di tenants)
```

### Key Relationships

- **Tenant** has many **Branches**
- **Branch** has many **Vehicles**
- **Vehicle** has many **Bookings**
- **Vehicle** has many **MaintenanceRecords**
- **Vehicle** has many **VehicleDocuments**
- **Customer** has many **Bookings**
- **Booking** has many **Payments**

### Entity Details

Setiap tabel memiliki kolom standar: `id uuid PK`, `tenant_id uuid FK → tenants`, `created_at`, `updated_at`.

| Tabel | Kolom Kunci |
|-------|-------------|
| `tenants` | name, subscription_tier, subscription_status, trial_ends_at |
| `profiles` | id = auth.users.id, tenant_id, role (owner/admin/operator/viewer) |
| `branches` | name, address, lat/lng, operating_hours (jsonb), status |
| `vehicles` | brand, model, year, plate_no (unik per tenant), price_daily/weekly/monthly/with_driver, status |
| `vehicle_documents` | type (stnk/bpkb/insurance), file_url, expires_at |
| `maintenance_records` | scheduled_at, type, cost, completed |
| `customers` | name, phone (unik per tenant), ktp_url, sim_url, status, rating |
| `bookings` | vehicle_id, customer_id, start_at, end_at, with_driver, price_total, dp_amount, status |
| `payments` | booking_id, type (dp/settlement/deposit/fine/refund), amount, provider |

---

## 4. Multi-Tenant Strategy

**Row-level isolation di application layer** (Drizzle query selalu filter tenant_id):

```ts
// Setiap query WAJIB filter tenant_id
const [row] = await db.select().from(vehicles)
  .where(and(eq(vehicles.id, id), eq(vehicles.tenant_id, ctx.tenantId)))
  .limit(1)
```

**Dua lapis keamanan:**
1. **Drizzle / application code** — koneksi langsung sebagai DB owner (bypass RLS).
   Setiap handler memfilter `tenant_id` dari `event.context.auth.tenantId`.
2. **RLS (defense-in-depth)** — semua tabel punya policy `USING (tenant_id = private.current_tenant_id())`
   untuk akses via jalur selain Drizzle (mis. Supabase client).

**Tenant resolution flow:**
1. User signup via Supabase Auth → sesi tersimpan di JWT
2. `POST /api/auth/bootstrap` → buat tenant baru + profil owner, trial 14 hari
3. Setiap request berikutnya → server middleware `server/middleware/auth.ts`:
   - Resolve user dari `serverSupabaseUser(event)`
   - Ambil profil (tenant_id + role) dari DB via Drizzle
   - Simpan ke `event.context.auth = { userId, tenantId, role }`
4. Handler pakai `requireAuth(event)` → dapat `ctx.tenantId` → filter semua query

---

## 5. Key Flows (MVP)

### Booking Lifecycle

```
POST /api/bookings → status: pending
PATCH status → confirmed (vehicle → booked)
PATCH status → active (vehicle → on_rent)
PATCH status → completed (vehicle → inspection)
PATCH status → canceled (vehicle → available bila tak ada booking lain)
```

### Fleet Status Lifecycle

```
AVAILABLE → BOOKED → ON_RENT → INSPECTION → AVAILABLE
                                            → MAINTENANCE → AVAILABLE
```

(Sinkronisasi otomatis via trigger `sync_vehicle_status` saat booking berubah status.)

### Payment Flow (Stub)

```
POST /api/bookings/:id/payment → tersimpan di tabel payments
(Integrasi Midtrans/Xendit nyata: post-MVP)
```

### Booking Flow (via WhatsApp) — Stub

```
POST /api/whatsapp/webhook → tercatat di log, siap integrasi nyata
```

---

## 6. API Design

RESTful API under `/api/*` served by Nitro server:

```
GET    /api/health                         — Health check

POST   /api/auth/bootstrap                 — Buat tenant + profil setelah signup
GET    /api/me                             — Profil + tenant saat ini
GET    /api/tenant                         — Detail tenant
PATCH  /api/tenant                         — Update profil bisnis

GET    /api/branches                       — List cabang (paginasi + cari)
POST   /api/branches                       — Tambah cabang
GET    /api/branches/:id                   — Detail cabang
PATCH  /api/branches/:id                   — Update cabang
DELETE /api/branches/:id                   — Hapus cabang

GET    /api/fleet                          — List kendaraan (filter cabang/status + cari)
POST   /api/fleet                          — Tambah kendaraan
GET    /api/fleet/:id                      — Detail kendaraan
PATCH  /api/fleet/:id                      — Update kendaraan
DELETE /api/fleet/:id                      — Hapus kendaraan
PATCH  /api/fleet/:id/status               — Ubah status
POST   /api/fleet/:id/maintenance          — Jadwalkan servis

GET    /api/customers                      — List pelanggan (cari nama/phone)
POST   /api/customers                      — Tambah pelanggan
GET    /api/customers/:id                  — Detail pelanggan
PATCH  /api/customers/:id                  — Update pelanggan
GET    /api/customers/:id/rentals          — Riwayat sewa
POST   /api/customers/:id/blacklist        — Blacklist

GET    /api/bookings                       — List booking (filter status/rentang)
POST   /api/bookings                       — Buat booking (auto-hitung harga, cek overbooking)
GET    /api/bookings/:id                   — Detail booking
PATCH  /api/bookings/:id                   — Update booking
PATCH  /api/bookings/:id/status            — Ubah status (validasi transisi)
POST   /api/bookings/:id/payment           — Catat pembayaran

GET    /api/reports/summary                — Ringkasan dashboard
POST   /api/whatsapp/webhook               — Stub WA
POST   /api/payments/midtrans/notify       — Stub Midtrans
POST   /api/gps/ingest                     — Stub GPS ingress
GET    /api/gps/vehicles/:id/location      — Stub posisi kendaraan
```

---

## 7. Security Boundaries

```
[Public]
    ├── /api/health               — Health check
    ├── /api/auth/bootstrap        — Dipanggil setelah signup (butuh sesi, tidak butuh profil)
    ├── /api/whatsapp/webhook      — Stub WA (tidak butuh auth)
    ├── /api/payments/midtrans/notify — Stub payment
    └── /api/gps/ingest            — Stub GPS

[Authenticated — all roles]
    ├── /api/me                   — Profil sendiri
    ├── /api/branches             — List cabang
    ├── /api/fleet                — List kendaraan
    ├── /api/customers            — List pelanggan
    ├── /api/bookings             — List booking
    └── /api/reports/summary      — Ringkasan dashboard

[Role-gated]
    ├── admin+   → POST/PATCH/DELETE branches, fleet, customers, payments
    ├── operator+ → PATCH fleet/:id/status, POST/PATCH bookings, PATCH bookings/:id/status
    └── owner    → DELETE cabang, DELETE kendaraan, POST blacklist
```

---

## 8. Data Flow Diagram

```
[Browser / Frontend]
    ↓
[Nuxt / Nitro]
    ├── Drizzle ORM → [Supabase Postgres]
    ├── Supabase Auth → [JWT / Sessions]
    └── Supabase Storage → [Files (KTP, SIM, photos)]
```

---

## 9. Deployment Architecture (Saat Ini)

```
[Local Dev]
    ├── npm run dev → localhost:3000
    └── Supabase Cloud → database + auth + storage

[Target Produksi]
    └── Cloudflare VPS + Cloudflare Tunnel (belum diimplementasikan)
```

---

## 10. Perubahan dari Blueprint Awal

| Aspek | Rencana Awal | Realita |
|-------|-------------|---------|
| Database | PostgreSQL self-hosted | Supabase Postgres managed |
| Cache/Queue | Redis 7 | Belum ada (post-MVP) |
| Storage | Cloudflare R2 | Supabase Storage |
| ORM | Drizzle optional | Drizzle = source of truth |
| Auth | JWT custom | Supabase Auth |
| Deployment | Docker + CF Tunnel | Masih dev lokal |
| Real-time | WebSocket (socket.io) | Belum ada |
| WA Queue | BullMQ | Stub |
