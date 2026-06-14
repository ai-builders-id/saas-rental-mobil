# Product Requirements Document (PRD)

## Aplikasi Tracking Mobil Rental — SaaS Platform

---

## 1. Ringkasan Eksekutif

Platform SaaS multi-tenant untuk bisnis rental mobil di Indonesia. Membantu owner mengelola armada, cabang, booking, pembayaran, dan tracking secara real-time dalam satu dashboard terpadu. Terintegrasi dengan WhatsApp chatbot untuk otomatisasi booking dan pembayaran.

**Target Pasar:** Bisnis rental mobil kecil-menengah (2-50 unit) di Indonesia.

---

## 2. Masalah yang Dipecahkan

| Masalah | Dampak | Solusi |
|---------|--------|--------|
| Manajemen armada manual (Excel/buku) | Overbooking, aset menganggur | Dashboard real-time status armada |
| Data cabang terpencar | Rekonsiliasi manual, visibilitas rendah | Dashboard multi-cabang terpusat |
| Booking via WA manual | Respon lambat, booking hilang | WA Chatbot otomatis + payment link |
| Tracking GPS tidak terintegrasi | Sulit monitoring aset real-time | Peta live + geofencing + alert |
| Pembayaran manual (tunai/transfer) | Rekonsiliasi lama, risk fraud | Payment gateway terintegrasi |
| Tidak ada riwayat pelanggan | Risk sewa ke oknum, repeat rate rendah | CRM + blacklist + verifikasi KTP |

---

## 3. Target Pengguna

### Primary: Owner Bisnis Rental
- Usia 30-55 tahun
- Memiliki 2-50 unit mobil
- Mungkin memiliki 1-5 cabang
- Melek teknologi dasar (bisa WA, browsing)
- Butuh akses via HP maupun laptop

### Secondary: Staff / Operator
- Karyawan yang handle booking, pickup, return
- Butuh antarmuka simpel untuk operasional harian

### Tertiary: Customer (end-user via WA)
- Penyewa mobil
- Hanya berinteraksi via WhatsApp chatbot

---

## 4. Fitur Utama (MVP)

### 4.1 Manajemen Armada
- CRUD kendaraan (merk, model, tahun, plat, warna, foto)
- Status tracking: AVAILABLE | BOOKED | ON_RENT | MAINTENANCE | INSPECTION
- Jadwal servis & maintenance reminder
- Upload dokumen kendaraan (STNK, BPKB, asuransi)

### 4.2 Multi-Cabang
- Registrasi & kelola cabang
- Transfer armada antar cabang
- Dashboard per-cabang & consolidated

### 4.3 Booking & Reservasi
- Kalender booking (drag & drop)
- Harga sewa dinamis (harian, mingguan, bulanan, paket driver)
- Buffer time antar booking
- Blackout dates

### 4.4 WhatsApp Chatbot Booking
- Auto-reply ketersediaan unit
- Kirim quote + link pembayaran via WA
- Verifikasi KTP via foto (disimpan)
- Konfirmasi booking otomatis
- Notifikasi: H-1 reminder, overdue alert, promo

### 4.5 Manajemen Pelanggan
- Database pelanggan (nama, no HP, KTP, SIM, alamat)
- Riwayat sewa per pelanggan
- Blacklist customer
- Verifikasi dokumen (KTP, SIM)

### 4.6 Pembayaran
- Integrasi Midtrans/Xendit
- QRIS, Virtual Account, E-Wallet
- DP (30-50%) saat booking
- Pelunasan saat pickup
- Deposit refundable
- Denda otomatis
- Invoice otomatis PDF

### 4.7 GPS Tracking
- Peta live tracking semua unit
- History rute perjalanan
- Geofencing alert
- Speed monitoring

### 4.8 Laporan & Analitik
- Laporan harian/mingguan/bulanan
- Utilisasi armada
- Revenue per cabang
- Laporan pajak siap pakai

### 4.9 Subscription & Billing
- Multi-tier pricing
- Trial 14 hari
- Auto-invoice & payment reminder

---

## 5. Fitur Post-MVP

| Fitur | Prioritas | Timeline |
|-------|-----------|----------|
| Mobile app (Android/iOS) | Medium | Q2+ |
| E-sign kontrak digital | High | Q1+ |
| Integrasi akuntansi (Jurnal, Accurate) | Medium | Q2+ |
| Multi-bahasa (English) | Low | Q3+ |
| AI predictive maintenance | Low | Q3+ |
| Public website builder per tenant | Low | Q4+ |
| Marketplace antar rental (sewa unit) | Low | Q4+ |

---

## 6. User Stories

### Owner
- "Sebagai owner, saya ingin melihat semua armada saya di satu dashboard sehingga saya tahu mobil mana yang sedang disewa, ready, atau maintenance."
- "Sebagai owner, saya ingin mengontrol cabang-cabang saya dari satu platform sehingga tidak perlu buka-buka sistem terpisah."
- "Sebagai owner, saya ingin pelanggan bisa booking via WhatsApp secara otomatis sehingga saya tidak perlu repot reply satu-satu."

### Staff
- "Sebagai staff, saya ingin input status mobil dengan cepat saat pickup dan return."
- "Sebagai staff, saya ingin cetak invoice otomatis untuk diserahkan ke pelanggan."

### Customer
- "Sebagai customer, saya ingin cek ketersediaan mobil dan booking cukup lewat WhatsApp."
- "Sebagai customer, saya ingin terima bukti pembayaran dan invoice via WhatsApp."

---

## 7. Metrik Kesuksesan

| Metrik | Target (3 bulan) | Target (12 bulan) |
|--------|------------------|-------------------|
| Jumlah tenant aktif | 50 | 500 |
| Booking via WA chatbot | 30% dari total booking | 70% |
| Utilisasi armada rata-rata | - | 65%+ |
| Churn rate bulanan | <10% | <5% |
| NPS | - | 40+ |

---

## 8. Asumsi & Dependensi

- WhatsApp Business API approval (Meta) — bisa delay 1-4 minggu
- GPS device compatibility — perlu dukungan multi-provider
- Cloudflare Tunnel — network latency acceptable
- Target pengguna punya koneksi internet stabil
- Regulasi asuransi kendaraan wajib mulai berlaku bertahap
