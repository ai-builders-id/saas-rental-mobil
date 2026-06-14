# SaaS Rental Mobil

> Platform SaaS multi-tenant untuk manajemen bisnis rental mobil di Indonesia.

## Fitur Utama

- **Manajemen Armada** — CRUD kendaraan, status tracking (AVAILABLE, BOOKED, ON_RENT, MAINTENANCE, INSPECTION), jadwal servis & maintenance reminder
- **Multi-Cabang** — Registrasi & kelola cabang, transfer armada antar cabang, dashboard consolidated
- **Booking & Reservasi** — Kalender booking, harga dinamis, buffer time, blackout dates
- **WhatsApp Chatbot** — Auto-reply ketersediaan, kirim quote + link pembayaran, verifikasi KTP, notifikasi otomatis
- **Manajemen Pelanggan** — Database pelanggan, riwayat sewa, blacklist, verifikasi dokumen
- **Pembayaran** — Integrasi Midtrans/Xendit (QRIS, VA, E-Wallet), DP, deposit refundable, denda otomatis, invoice PDF
- **GPS Tracking** — Peta live, history rute, geofencing alert, speed monitoring
- **Laporan & Analitik** — Harian/mingguan/bulanan, utilisasi armada, revenue per cabang, laporan pajak
- **Subscription & Billing** — Multi-tier pricing, trial 14 hari, auto-invoice

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | Nuxt 4, Vue 3, Nuxt UI 4, Tailwind CSS v4, TypeScript |
| **Backend** | Nitro (Nuxt 4 built-in server) |
| **Database** | PostgreSQL 16 |
| **Cache & Queue** | Redis 7 |
| **ORM** | Drizzle ORM |
| **Payment** | Midtrans, Xendit |
| **Storage** | Cloudflare R2 |
| **Hosting** | Cloudflare VPS + Cloudflare Tunnel |
| **CI/CD** | GitHub Actions |

## Arsitektur

```
[Cloudflare VPS]
    ├── Nuxt 4 (SSR) — Frontend + API Server (Nitro)
    ├── PostgreSQL — Primary Database
    ├── Redis — Cache + Queue + Real-time
    └── Cloudflare Tunnel — Secure Ingress

[External Services]
    ├── Midtrans/Xendit — Payment Gateway
    ├── WhatsApp Business API — Chatbot Booking
    ├── GPS Provider API — Fleet Tracking
    └── Cloudflare R2 — File Storage
```

## Multi-Tenant

Row-level isolation dengan `tenant_id` di setiap tabel. Tenant di-resolve dari JWT claim via server middleware.

## Lisensi

Hak cipta dilindungi. Proyek ini dikelola oleh **ai-builders.id**.
