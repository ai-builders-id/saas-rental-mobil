# Roadmap — Aplikasi Tracking Mobil Rental

> **Checklist detail:** Lihat `checklist.md` untuk daftar periksa lengkap
> dengan status per item.
>
> **Catatan:** Status di bawah adalah hasil iterasi pertama (backend + frontend MVP).
> Lihat `README.md` untuk detail implementasi terkini.

---

## Phase 0: Foundation ✅ Selesai
Lihat checklist → `checklist.md#1-foundation--phase-0`

**Deliverable:**
- ✅ Proyek Nuxt 4 dapat dijalankan (`npm run dev`)
- ✅ Database terhubung ke Supabase Postgres
- ✅ Design system dasar berfungsi (17 komponen)

---

## Phase 1: Core MVP ✅ Selesai
Lihat checklist → `checklist.md#2-core-mvp--phase-1`

**Deliverable:**
- ✅ Owner dapat register + setup tenant
- ✅ CRUD armada + cabang
- ✅ Booking manual berfungsi
- ✅ 13 halaman frontend berfungsi

---

## Phase 2: Integrasi 🟡 (Sedang Berjalan)

| Fitur | Status | Checklist |
|-------|--------|-----------|
| WhatsApp Chatbot | 🟡 Stub (`POST /api/whatsapp/webhook`) | [#3.1](checklist.md#31-whatsapp-chatbot) |
| Payment Gateway | 🟡 Stub (`POST /api/bookings/:id/payment`) | [#3.2](checklist.md#32-payment-gateway) |
| GPS Tracking | 🟡 Stub | [#3.3](checklist.md#33-gps-tracking) |

---

## Phase 3: Enhancement (Post-MVP)

| Fitur | Prioritas | Checklist |
|-------|-----------|-----------|
| Staff management (role RBAC penuh) | Tinggi | [#4.2](checklist.md#42-staff--rbac) |
| Laporan operasional & keuangan | Tinggi | [#4.1](checklist.md#41-laporan--analitik) |
| Export Excel/PDF | Sedang | [#4.1](checklist.md#41-laporan--analitik) |
| Security hardening | Tinggi | [#4.3](checklist.md#43-security) |
| Subscription & billing auto | Sedang | — |

## Phase 4: Production & Scale

| Fitur | Prioritas | Checklist |
|-------|-----------|-----------|
| Docker Compose production | Sedang | [#4.4](checklist.md#44-infrastructure) |
| Cloudflare VPS + Tunnel | Tinggi | [#4.4](checklist.md#44-infrastructure) |
| CI/CD pipeline (GitHub Actions) | Sedang | [#4.4](checklist.md#44-infrastructure) |
| Redis cache + queue | Sedang | [#4.4](checklist.md#44-infrastructure) |
| Sentry monitoring | Tinggi | [#4.4](checklist.md#44-infrastructure) |
| Backup & recovery | Tinggi | [#4.4](checklist.md#44-infrastructure) |

---

## Timeline Visual

```
                 Selesai                     Sedang dikerjakan
        ┌──────────────────────┐┌───────────────┐
Phase 0 │  Foundation (✅)     ││               │
        └──────────────────────┘└───────────────┘
        ┌──────────────────────────┐┌────────────┐
Phase 1 │  Core MVP (✅)           ││            │
        └──────────────────────────┘└────────────┘
        ┌──────────────────┐┌──────────────────────┐
Phase 2 │  Stub integrasi  ││  Integrasi nyata      │
        │  (✅)            ││  (🟡 sedang)           │
        └──────────────────┘└──────────────────────┘
        ┌──────────────────────────────────────────┐
Phase 3 │  Enhancement (❌ belum)                   │
        └──────────────────────────────────────────┘
        ┌──────────────────────────────────────────┐
Phase 4 │  Production (❌ belum)                    │
        └──────────────────────────────────────────┘
```

> 📋 **Checklist detail untuk semua phase:** `checklist.md`
