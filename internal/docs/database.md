# Database — Aplikasi Tracking Mobil Rental

> Berisi skema, migrasi, kebijakan akses, dan prosedur database.
> Sumber kebenaran skema: `server/db/schema.ts` (Drizzle ORM).

---

## 1. Teknologi

| Komponen | Pilihan | Keterangan |
|----------|---------|------------|
| Database | PostgreSQL 16 (via Supabase) | Hosted, managed backup, point-in-time recovery |
| ORM | Drizzle ORM 0.45+ | Type-safe, SQL-like syntax, migration generation |
| Driver | `postgres.js` 3.x | Ringan, kompatibel dengan transaction pooler Supabase |
| Migrasi | `drizzle-kit` generate + custom `scripts/migrate.mjs` | DDL dari schema, eksekusi SQL via pg |

### Koneksi

```
# Session pooler (5432) — untuk query umum
postgresql://postgres.eikwssgmghsdakkibicr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# Transaction pooler (6543) — untuk prepared statement / transaksi
postgresql://postgres.eikwssgmghsdakkibicr:[PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres

# Direct connection (hanya untuk migrasi DDL)
postgresql://postgres:[PASSWORD]@db.eikwssgmghsdakkibicr.supabase.co:5432/postgres
```

---

## 2. Skema Database

### 2.1 Enums

```sql
user_role          → 'owner' | 'admin' | 'operator' | 'viewer'
subscription_tier  → 'starter' | 'pro' | 'enterprise'
subscription_status → 'trialing' | 'active' | 'past_due' | 'canceled'
branch_status      → 'active' | 'inactive'
fleet_status       → 'available' | 'booked' | 'on_rent' | 'maintenance' | 'inspection'
booking_status     → 'pending' | 'confirmed' | 'active' | 'completed' | 'canceled'
payment_type       → 'dp' | 'settlement' | 'deposit' | 'fine' | 'refund'
payment_status     → 'pending' | 'settled' | 'expired' | 'refunded' | 'failed'
customer_status    → 'active' | 'blacklisted'
document_type      → 'stnk' | 'bpkb' | 'insurance'
```

### 2.2 Tabel

| Tabel | Primary Key | Tenant-scoped | Catatan |
|-------|-------------|---------------|---------|
| `tenants` | `id` UUID | — | Root tenant — satu baris per bisnis |
| `profiles` | `id` UUID (FK → auth.users) | ✅ `tenant_id` | 1:1 dengan Supabase auth user |
| `branches` | `id` UUID | ✅ `tenant_id` | Cabang operasional |
| `vehicles` | `id` UUID | ✅ `tenant_id` | Kendaraan armada |
| `vehicle_documents` | `id` UUID | ✅ `tenant_id` | Dokumen STNK/BPKB/insurance |
| `maintenance_records` | `id` UUID | ✅ `tenant_id` | Riwayat servis |
| `customers` | `id` UUID | ✅ `tenant_id` | Pelanggan (unique: phone per tenant) |
| `bookings` | `id` UUID | ✅ `tenant_id` | Booking sewa |
| `payments` | `id` UUID | ✅ `tenant_id` | Riwayat pembayaran |

### 2.3 Relasi Utama

```
tenants 1──N profiles
tenants 1──N branches
tenants 1──N vehicles
tenants 1──N customers
tenants 1──N bookings
tenants 1──N payments
branches 1──N vehicles
vehicles 1──N bookings
vehicles 1──N vehicle_documents
vehicles 1──N maintenance_records
customers 1──N bookings
bookings 1──N payments
```

---

## 3. Migrasi

### 3.1 Cara Kerja

Migrasi DDL **dibangkitkan** dari `server/db/schema.ts` via `drizzle-kit`:

```bash
npm run db:generate    # Generate SQL migrasi dari perubahan schema
npm run db:migrate     # Jalankan ke Supabase Postgres
npm run db:seed        # + seed data demo
npm run db:studio      # Buka Drizzle Studio (GUI browser)
```

Eksekusi migrasi diproses oleh `scripts/migrate.mjs`:
- Urut berdasarkan nama file (prefix numerik)
- Setiap file di-wrap dalam transaksi (`BEGIN`/`COMMIT`)
- Idempoten: track file yang sudah dijalankan di tabel `public._migrations`

### 3.2 File Migrasi (urutan)

| File | Isi | Status |
|------|-----|--------|
| `0000_init.sql` | Enums, 9 tabel, foreign keys, indexes | ✅ Applied |
| `0001_extras.sql` | Extension `btree_gist`, FK `profiles → auth.users`, overbooking exclusion constraint, schema `private` | ✅ Applied |
| `0002_functions_triggers.sql` | Helper `current_tenant_id()`, `current_role()`, trigger `updated_at`, `sync_vehicle_status` | ✅ Applied |
| `0003_rls.sql` | Row Level Security — isolasi per-tenant di semua tabel | ✅ Applied |
| `0004_storage.sql` | Storage bucket + RLS policy (vehicle-photos, vehicle-docs, customer-docs, tenant-logos) | ✅ Applied |

---

## 4. Keamanan & Isolasi Tenant

### 4.1 Arsitektur Isolasi (Defense in Depth)

```
Layer 1: Auth Middleware (server/middleware/auth.ts)
  → Resolve JWT → set event.context.auth = { userId, tenantId, role }
  → 401 jika token invalid/expired

Layer 2: Query Filter (wajib)
  → Setiap query Drizzle WAJIB filter WHERE tenant_id = ctx.tenantId
  → Helper findOwned() di server/utils/repo.ts

Layer 3: RLS (database level)
  → Service role bypass RLS → Layer 2 sebagai perlindungan utama
  → Supabase client via anon key → RLS sebagai pertahanan tambahan

Layer 4: Role-based Access
  → requireMinRole(event, 'admin') / requireRole(event, 'owner')
  → Guard di setiap endpoint yang membutuhkan akses terbatas
```

### 4.2 Policy RLS

Semua tabel bisnis menggunakan pola seragam:
```sql
CREATE POLICY <table>_select ON <table>
  FOR SELECT TO authenticated
  USING (tenant_id = private.current_tenant_id());

CREATE POLICY <table>_insert ON <table>
  FOR INSERT TO authenticated
  WITH CHECK (tenant_id = private.current_tenant_id());

CREATE POLICY <table>_update ON <table>
  FOR UPDATE TO authenticated
  USING (tenant_id = private.current_tenant_id())
  WITH CHECK (tenant_id = private.current_tenant_id());

CREATE POLICY <table>_delete ON <table>
  FOR DELETE TO authenticated
  USING (tenant_id = private.current_tenant_id());
```

**Storage** menggunakan prefix path tenant: `/<tenant_id>/...`

---

## 5. Trigger & Constraint

| Trigger/Constraint | Tabel | Fungsi |
|--------------------|-------|--------|
| `trg_set_updated_at` | Semua tabel | Auto-set `updated_at = now()` pada UPDATE |
| `trg_sync_vehicle_status` | `bookings` | Auto-update vehicle status: confirmed→booked, active→on_rent, completed→inspection, canceled→available |
| `no_overlap_booking` | `bookings` | Exclusion constraint (GIST) — cegah overbooking per vehicle |
| `uq_vehicle_plate_per_tenant` | `vehicles` | Unique plate_no per tenant |
| `uq_customer_phone_per_tenant` | `customers` | Unique phone per tenant |

---

## 6. Scripts

```bash
# Jalankan semua migrasi
node scripts/migrate.mjs

# Jalankan migrasi + seed data demo
node scripts/migrate.mjs --seed

# Generate migrasi baru dari schema Drizzle
npm run db:generate

# Buka Drizzle Studio (GUI)
npm run db:studio
```
