# Functional Requirements Document (FRD)

## Aplikasi Tracking Mobil Rental — SaaS Platform

**Status Implementasi: ✅ Selesai (MVP) / 🟡 Stub / ❌ Post-MVP**

---

## 1. Authentication & Authorization

### FR-01: User Registration ✅
- ✅ Signup via Supabase Auth (email + password) — halaman `/register`
- ❌ Verifikasi email — disabled untuk MVP (`enable_confirmations: false`)
- ✅ Auto-create tenant profile via `POST /api/auth/bootstrap`
- ✅ Pilih subscription tier saat registrasi (default: Pro)
- ✅ Trial 14 hari otomatis aktif

### FR-02: User Login ✅
- ✅ Login via email + password — halaman `/login`
- ❌ OAuth 2.0 (Google) — post-MVP
- 🟡 "Remember me" — Supabase Auth handle session
- 🟡 Rate limiting — Supabase Auth handle

### FR-03: Role-Based Access Control ✅
| Role | Implementasi |
|------|-------------|
| **Owner** | ✅ Full access — delete cabang/kendaraan, blacklist |
| **Admin** | ✅ CRUD semua resource |
| **Operator** | ✅ Booking, fleet status update |
| **Viewer** | ✅ Read-only (guard di middleware) |

### FR-04: Password Management 🟡
- ✅ Reset password — Supabase Auth built-in
- ✅ Password policy — Supabase default (min 6 chars)
- 🟡 Hash — Supabase bcrypt internal

---

## 2. Tenant Management

### FR-05: Tenant Profile ✅
- ✅ Nama bisnis, alamat, no telepon, email — `GET/PATCH /api/tenant`
- 🟡 Logo — bucket `tenant-logos` siap, upload via frontend: post-MVP
- ✅ Timezone & currency (IDR default)

### FR-06: Subscription Management 🟡
- ✅ Lihat current tier & status — via `/api/me`
- ❌ Upgrade/downgrade — post-MVP
- ❌ Invoice history — post-MVP
- ❌ Cancel subscription — post-MVP

### FR-07: Staff Management 🟡
- 🟡 Role assignment via `profiles.role` — data siap, UI belum
- ✅ Middleware guard `requireMinRole()` — backend siap
- ❌ Aktivasi/deaktivasi akun staff — via `profiles.is_active` (backend bisa, UI belum)

---

## 3. Fleet Management

### FR-08: Vehicle CRUD ✅
| Field | Tipe | Impl |
|-------|------|------|
| Merk | String | ✅ |
| Model | String | ✅ |
| Tahun | Number | ✅ |
| Plat Nomor | String | ✅ (unique per tenant) |
| Warna | String | ✅ |
| Foto | Image[] | ✅ (bucket siap, upload via UI) |
| Harga Sewa/Hari | Number | ✅ |
| Harga Sewa/Minggu | Number | ✅ optional |
| Harga Sewa/Bulan | Number | ✅ optional |
| Harga Dengan Sopir | Number | ✅ optional |
| Status | Enum | ✅ auto |
| Cabang | UUID | ✅ FK ke branches |

### FR-09: Fleet Status Automation ✅
- ✅ **AVAILABLE** → Default saat ditambahkan / otomatis saat booking selesai+inspection
- ✅ **BOOKED** → Saat booking dikonfirmasi (trigger `sync_vehicle_status`)
- ✅ **ON_RENT** → Saat pickup / booking active
- ✅ **INSPECTION** → Saat booking completed
- ✅ **MAINTENANCE** → Manual via `PATCH /api/fleet/:id/status`

### FR-10: Maintenance Schedule ✅
- ✅ Jadwal servis — `POST /api/fleet/:id/maintenance`
- 🟡 Reminder H-7, H-1 — perlu cron/service
- ✅ Riwayat maintenance — tabel `maintenance_records`
- 🟡 Auto-MAINTENANCE — trigger belum (masih manual)

### FR-11: Document Management ✅
- ✅ Upload STNK, BPKB, asuransi — bucket `vehicle-docs` siap
- 🟡 Expiry reminder — post-MVP

---

## 4. Branch Management

### FR-12: Branch CRUD ✅
- ✅ CRUD cabang — `/api/branches/*`
- ✅ Peta lokasi (lat/lng field siap — integrasi Google Maps: post-MVP)
- 🟡 Foto cabang — `photo_url` field siap

### FR-13: Fleet Transfer 🟡
- 🟡 Backend bisa (POST /api/branches/:id/transfer), belum sebagai endpoint terpisah
- 🟡 Riwayat perpindahan — post-MVP

### FR-14: Consolidated Dashboard ✅
- ✅ Ringkasan semua cabang — `GET /api/reports/summary`

---

## 5. Booking & Reservation

### FR-15: Manual Booking ✅
- ✅ Pilih kendaraan → date range → customer
- ✅ Auto-check ketersediaan (exclusion constraint `no_overlap_booking`)
- ✅ Harga otomatis (computeBookingPrice)
- ✅ Status workflow validasi (BOOKING_TRANSITIONS)

### FR-16: WhatsApp Booking Flow 🟡
- 🟡 `POST /api/whatsapp/webhook` — stub siap
- ❌ Chatbot flow — post-MVP

### FR-17: Calendar View ✅
- ✅ List booking dengan filter date range — `GET /api/bookings?from=&to=`
- ✅ Halaman `/bookings` — frontend dengan kalender
- ❌ Drag & drop reschedule — post-MVP

### FR-18: Pricing & Discount ✅
- ✅ Harga dinamis harian/mingguan/bulanan
- ✅ Biaya tambahan driver
- 🟡 Denda, promo, blackout dates — post-MVP

---

## 6. Customer Management

### FR-19: Customer Database ✅
- ✅ CRUD pelanggan — `/api/customers/*`
- ✅ Riwayat sewa — `GET /api/customers/:id/rentals`
- ✅ Rating otomatis
- ✅ Blacklist flag + alasan

### FR-20: Customer Verification 🟡
- 🟡 KTP/SIM upload — bucket `customer-docs` siap
- ❌ OCR KTP — post-MVP
- ❌ Face match — post-MVP
- ✅ Blacklist check otomatis saat booking create

---

## 7. Payment

### FR-21: Payment Gateway Integration 🟡
- 🟡 Tabel `payments` siap — semua status & tipe
- 🟡 `POST /api/payments/midtrans/notify` — stub
- ❌ Midtrans/Xendit integrasi nyata — post-MVP

### FR-22: Payment Flow 🟡
- 🟡 DP (30-50%) — `dp_amount` di booking
- 🟡 Pelunasan + deposit — bisa dicatat via `POST /api/bookings/:id/payment`
- ❌ Refund deposit — post-MVP
- ❌ Denda dipotong dari deposit — post-MVP

### FR-23: Invoice 🟡
- 🟡 Invoice number format — belum
- ❌ Auto-generate PDF — post-MVP
- ❌ WA & email — post-MVP

### FR-24: Reconciliation 🟡
- ✅ Status payment: PENDING / SETTLED / REFUND / EXPIRED / FAILED
- ❌ Daily auto-reconciliation — post-MVP

---

## 8. GPS Tracking

### FR-25: Real-Time Location 🟡
- 🟡 `GET /api/gps/vehicles/:id/location` — stub (random koordinat)
- 🟡 Halaman `/gps` — map view dengan Google Maps
- ❌ Update posisi setiap 30-60 detik — post-MVP

### FR-26: GPS History ❌
- ❌ Playback rute — post-MVP
- ❌ Total KM — post-MVP

### FR-27: Geofencing ❌ — post-MVP

### FR-28: Speed & Behavior Monitoring ❌ — post-MVP

---

## 9. WhatsApp Integration 🟡 — semua masih stub

### FR-29: WhatsApp Business API 🟡
- 🟡 Webhook handler — `POST /api/whatsapp/webhook` (log saja)

### FR-30: Chatbot Conversation Flow ❌ — post-MVP

### FR-31: Automated Notifications ❌ — post-MVP

---

## 10. Reports & Analytics

### FR-32: Operational Reports ✅
- ✅ Fleet utilization rate — `GET /api/reports/summary`
- 🟡 Booking summary per periode — list dengan filter date range
- 🟡 Revenue report — data payments siap
- 🟡 Top customers — data rentals siap

### FR-33: Financial Reports 🟡
- 🟡 P&L summary — data siap, endpoint belum
- ❌ Tax report — post-MVP

### FR-34: Export ❌ — post-MVP

---

## 11. System Requirements

### FR-35: Multi-Language ❌ — post-MVP (bahasa Indonesia saja)

### FR-36: Mobile Responsive ✅
- ✅ Mobile-first design (Tailwind)
- ✅ Bottom navigation mobile
- ✅ Touch-friendly UI

### FR-37: Performance 🟡
- ✅ SSR untuk pages utama (Nuxt 4 default)
- 🟡 Page load < 2 detik — belum diukur
- 🟡 Time to Interactive < 3 detik — belum diukur

### FR-38: Backup & Recovery ❌ — post-MVP
