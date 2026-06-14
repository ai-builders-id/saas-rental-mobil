# Product Requirements Document (PRD)

## Aplikasi Tracking Mobil Rental — SaaS Platform

---

## 1. Ringkasan Eksekutif

Platform SaaS multi-tenant untuk bisnis rental mobil di Indonesia. Membantu owner mengelola armada, cabang, booking, pembayaran, dan tracking secara real-time dalam satu dashboard terpadu. Terintegrasi dengan WhatsApp chatbot untuk otomatisasi booking dan pembayaran.

**Status Iterasi 1:** ✅ Backend API (25 endpoint) + Frontend (13 halaman) selesai.
Integrasi eksternal (WA, Midtrans, GPS) masih berupa **stub**.

---

## 2. Masalah yang Dipecahkan

| Masalah | Dampak | Solusi (MVP) |
|---------|--------|---------------|
| Manajemen armada manual (Excel/buku) | Overbooking, aset menganggur | Dashboard + API CRUD fleet dengan status tracking |
| Data cabang terpencar | Rekonsiliasi manual, visibilitas rendah | Dashboard multi-cabang terpusat |
| Booking via WA manual | Respon lambat, booking hilang | 🔸 Booking via dashboard dulu (WA chatbot: post-MVP) |
| Tracking GPS tidak terintegrasi | Sulit monitoring aset real-time | 🔸 Stub GPS, integrasi device: post-MVP |
| Pembayaran manual (tunai/transfer) | Rekonsiliasi lama, risk fraud | 🔸 Stub payment, integrasi Midtrans: post-MVP |
| Tidak ada riwayat pelanggan | Risk sewa ke oknum, repeat rate rendah | CRM + blacklist + rating ✅ |

---

## 3. Fitur yang Diimplementasikan (MVP)

### 3.1 Manajemen Armada ✅
- CRUD kendaraan (merk, model, tahun, plat, warna, foto)
- Status tracking: AVAILABLE | BOOKED | ON_RENT | MAINTENANCE | INSPECTION
- Jadwal servis & maintenance record
- Upload dokumen kendaraan (STNK, BPKB, asuransi) — bucket siap

### 3.2 Multi-Cabang ✅
- Registrasi & kelola cabang
- Dashboard per-cabang & consolidated

### 3.3 Booking & Reservasi ✅
- Kalender booking
- Harga sewa dinamis (harian, mingguan, bulanan, paket driver)
- Cegah overbooking (exclusion constraint)
- Workflow status: pending → confirmed → active → completed

### 3.4 Manajemen Pelanggan ✅
- Database pelanggan (nama, no HP, KTP/SIM storage)
- Riwayat sewa per pelanggan
- Blacklist customer
- Rating otomatis

### 3.5 Pembayaran 🟡
- Tabel payments siap (DP, settlement, deposit, denda, refund)
- Integrasi Midtrans/Xendit: **stub** (belum API nyata)

### 3.6 WhatsApp 🟡
- Webhook handler: **stub**

### 3.7 GPS Tracking 🟡
- Endpoint posisi: **stub**

### 3.8 Laporan ✅
- Ringkasan dashboard (data riil dari DB)

### 3.9 Subscription ✅
- Multi-tier pricing (starter/pro/enterprise) — data siap, logika belum aktif
- Trial 14 hari — di-set saat bootstrap

---

## 4. Fitur Post-MVP

| Fitur | Prioritas | Status |
|-------|-----------|--------|
| Midtrans/Xendit integrasi nyata | High | 🟡 Stub |
| WhatsApp Business API + Chatbot | High | 🟡 Stub |
| GPS provider integrasi | Medium | 🟡 Stub |
| Redis caching + queue | Medium | ❌ |
| Real-time WebSocket | Medium | ❌ |
| E-sign kontrak digital | Medium | ❌ |
| Staff management (RBAC penuh) | Medium | ❌ |
| Laporan keuangan & export | Medium | ❌ |
| Multi-bahasa (English) | Low | ❌ |
| Mobile app (Android/iOS) | Low | ❌ |

---

## 5. User Stories — Status

### Owner
- "Saya ingin melihat semua armada saya di satu dashboard" → ✅ `/dashboard`
- "Saya ingin mengontrol cabang-cabang saya dari satu platform" → ✅
- "Saya ingin pelanggan bisa booking via WhatsApp secara otomatis" → 🟡 Post-MVP

### Staff
- "Saya ingin input status mobil dengan cepat saat pickup dan return" → ✅ `PATCH /api/fleet/:id/status`
- "Saya ingin cetak invoice otomatis" → ❌ Post-MVP

### Customer
- "Saya ingin cek ketersediaan mobil dan booking lewat WhatsApp" → 🟡 Post-MVP
- "Saya ingin terima bukti pembayaran via WhatsApp" → 🟡 Post-MVP

---

## 6. Arsitektur Teknis

Lihat `techstack.md` dan `blueprint.md` untuk detail arsitektur terkini.

**Ringkasan:**
- **Backend:** Nuxt 4 / Nitro — 25 API endpoint
- **Database:** Supabase Postgres via Drizzle ORM
- **Auth:** Supabase Auth (JWT)
- **Storage:** Supabase Storage (4 bucket: vehicle-photos, vehicle-docs, customer-docs, tenant-logos)
- **Frontend:** Nuxt UI 4, 17 custom komponen, 13 halaman

---

## 7. Metrik Kesuksesan

| Metrik | Target (3 bulan) | Status |
|--------|------------------|--------|
| Jumlah tenant aktif | 50 | 🔴 Belum rilis |
| Booking via WA chatbot | 30% dari total booking | 🟡 Post-MVP |
| Utilisasi armada rata-rata | 65%+ | 🔴 Belum diukur |
| Churn rate bulanan | <10% | 🔴 Belum diukur |
| NPS | 40+ | 🔴 Belum diukur |
