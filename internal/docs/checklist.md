# Checklist — Aplikasi Tracking Mobil Rental

> Daftar periksa lintas-fitur. Status dikonsolidasi dari berbagai dokumen
> (`roadmap.md`, `security.md`, `prd.md`, `frd.md`) ke dalam satu file.
> **Update checklist ini** setiap ada perubahan status.

---

## 1. Foundation ✅ (Phase 0)

### 1.1 Project Setup
- [x] Inisialisasi proyek Nuxt 4 dengan Nuxt UI 4
- [x] Setup Tailwind CSS v4 + design tokens (Rajawali Rentcar)
- [x] Konfigurasi TypeScript strict, alias `#shared`, `~`
- [x] Setup Drizzle ORM + generated migration (`npm run db:generate`)
- [x] Setup Supabase Auth + Storage + connection
- [x] Setup Git + GitHub repository

### 1.2 Database
- [x] Setup PostgreSQL (via Supabase)
- [x] Schema: 9 tabel, 9 enum, indexes, constraints
- [x] Migrasi: 5 file (init, extras, triggers, RLS, storage)
- [x] Seed data: tenant demo, 2 cabang, 3 kendaraan, 2 pelanggan
- [x] Koneksi: session pooler + transaction pooler verified

---

## 2. Core MVP ✅ (Phase 1)

### 2.1 Auth & Tenant
- [x] Register page → Supabase Auth signup
- [x] Login page → Supabase Auth signInWithPassword
- [x] Multi-tenant middleware (`server/middleware/auth.ts`)
- [x] Tenant profile setup (`POST /api/auth/bootstrap`)
- [x] Role-based access (owner/admin/operator/viewer)

### 2.2 Fleet Management
- [x] CRUD kendaraan (5 endpoint)
- [x] Status fleet automation (trigger `sync_vehicle_status`)
- [x] Upload foto & dokumen (Supabase Storage — bucket siap)
- [x] Dashboard armada overview (`/dashboard`)
- [x] List armada + filter cabang/status/pencarian (`/fleet`)

### 2.3 Multi-Cabang
- [x] CRUD cabang (`/api/branches/*`)
- [x] Dashboard per-cabang & consolidated

### 2.4 Booking System
- [x] Kalender booking (`/bookings`)
- [x] CRUD booking (`/api/bookings/*`)
- [x] Status workflow (pending → confirmed → active → completed → canceled)
- [x] Cegah overbooking (exclusion constraint GIST)
- [x] Hitung harga otomatis (daily/weekly/monthly + driver surcharge)

### 2.5 Customer Management
- [x] Database pelanggan (name, phone, KTP/SIM storage)
- [x] Riwayat sewa per pelanggan
- [x] Blacklist customer
- [x] Rating otomatis

### 2.6 Payments
- [x] Tabel payments (type, amount, status, provider, ref)
- [x] Midtrans webhook stub (`POST /api/payments/midtrans/notify`)

---

## 3. Integrasi 🟡 (Phase 2 — Sedang Berjalan)

### 3.1 WhatsApp Chatbot
- [ ] Setup WA Business API account
- [ ] Webhook handler endpoint ✅ stub (`POST /api/whatsapp/webhook`)
- [ ] Chatbot flow: greeting → cek avail → quote → booking
- [ ] Kirim link payment via WA
- [ ] Notifikasi otomatis (reminder H-1, overdue)

### 3.2 Payment Gateway
- [ ] Integrasi Midtrans Snap (frontend + backend)
- [ ] DP & pelunasan flow end-to-end
- [ ] Deposit & refund flow
- [ ] Invoice auto-generate (PDF)

### 3.3 GPS Tracking
- [ ] GPS provider API integration
- [ ] Real-time map (`/gps`) — ✅ UI siap, 🟡 data stub
- [ ] History playback
- [ ] Geofencing alerts

---

## 4. Enhancement (Phase 3 — Post-MVP)

### 4.1 Laporan & Analitik
- [ ] Laporan operasional (utilisasi armada, booking per cabang)
- [ ] Laporan keuangan (revenue, outstanding, profit)
- [ ] Export Excel/PDF
- [ ] Dashboard analytics dengan grafik interaktif

### 4.2 Staff & RBAC
- [ ] Staff CRUD (tambah/edit/hapus user dalam tenant)
- [ ] Activity log per user
- [ ] Permission matrix granular

### 4.3 Security
- [x] SQL injection prevention — Drizzle parameterized queries
- [x] Input validation — Zod di setiap endpoint
- [x] Auth middleware — Supabase JWT resolved di setiap request
- [x] Tenant isolation — tenant_id filter di semua query
- [x] RLS defense-in-depth — policy di semua tabel
- [x] Role-based access — guard middleware
- [x] Service role terisolasi — hanya bisa diakses server
- [x] Storage bucket privat — path prefix tenant_id
- [ ] Rate limiting — belum implemented
- [ ] Audit log — belum diimplementasikan
- [ ] Data deletion API (UU PDP) — belum
- [ ] Signed URL untuk file access — belum

### 4.4 Infrastructure
- [ ] Redis caching + queue — ❌
- [ ] Docker Compose production — ❌
- [ ] Cloudflare VPS + Tunnel — ❌
- [ ] CI/CD pipeline (GitHub Actions) — ❌
- [ ] Sentry monitoring — ❌
- [ ] Backup & recovery automation — ❌

---

## 5. Compliance & Kepatuhan

| Requirement | Status | Notes |
|------------|--------|-------|
| UU PDP consent | 🟡 | Data PII di storage privat, deletion API belum |
| ISO 27001 | ❌ | Post-MVP, target year 2 |
| PCI DSS | N/A | Payment via gateway (Midtrans/Xendit) |
| WCAG 2.1 AA | 🟡 | Nuxt UI 4 built-in a11y — belum diaudit |
| GDPR | ❌ | Untuk ekspansi EU |

---

## 6. Security Testing Schedule

| Type | Frequency | Tool | Status |
|------|-----------|------|--------|
| Dependency scan | Weekly | Snyk / npm audit | ❌ |
| SAST | Every PR | SonarQube / CodeQL | ❌ |
| DAST | Monthly | OWASP ZAP | ❌ |
| Penetration test | Quarterly | External vendor | ❌ |

---

## 7. Metrik Kesuksesan

| Metrik | Target (3 bulan) | Status |
|--------|------------------|--------|
| Jumlah tenant aktif | 50 | 🔴 Belum rilis |
| Booking via WA chatbot | 30% dari total booking | 🟡 Post-MVP |
| Utilisasi armada rata-rata | 65%+ | 🔴 Belum diukur |
| Churn rate bulanan | <10% | 🔴 Belum diukur |
| NPS | 40+ | 🔴 Belum diukur |

---

## 8. Catatan

- Checklist ini adalah **sumber kebenaran tunggal** untuk tracking progress
- Jika ada checklist di file lain (`roadmap.md`, `security.md`, dll.) yang sudah
  dipindahkan ke sini, update file sumber untuk merujuk ke file ini
- Setiap perubahan status harus diikuti update checklist ini
