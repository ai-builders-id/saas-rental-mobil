# Business Requirements Document (BRD)

## Aplikasi Tracking Mobil Rental — SaaS Platform

**Status Implementasi: MVP Iterasi 1 ✅**

---

## 1. Ringkasan Bisnis

Platform SaaS yang menyediakan sistem manajemen armada, booking, pembayaran, dan tracking untuk bisnis rental mobil di Indonesia. Model bisnis subscription-based dengan target utama UMKM rental mobil (2-50 unit).

**Visi:** Menjadi sistem operasional standar untuk bisnis rental mobil di Indonesia.

**Misi:** Mentransformasi bisnis rental mobil Indonesia dari operasi manual ke digital terintegrasi.

**Status Sekarang:** MVP backend + frontend selesai. Integrasi WA, payment gateway, GPS: masih stub.

---

## 2. Analisis Pasar

| Metrik | Nilai |
|--------|-------|
| Pasar rental mobil Indonesia (2026) | ~USD 1 miliar |
| Growth rate (CAGR) | 16% |
| Proyeksi 2031 | ~USD 2.1 miliar |
| Jumlah bisnis rental (estimasi) | 15.000 - 25.000 |

### Diferensiasi Kami (MVP)
- **UI modern** — Nuxt UI 4, mobile-first, dark mode, desain kustom "Rajawali Rentcar"
- **Multi-cabang real-time** — satu dashboard semua cabang
- **Harga terjangkau** — mulai Rp 150-300rb/bulan
- **ORM + Type-safe** — Drizzle ORM, Zod validation di semua input
- 📌 WA Chatbot, GPS Tracking: **post-MVP**

---

## 3. Model Bisnis

### Pricing Tiers (siap digunakan, auto-billing: post-MVP)

| Tier | Harga | Kapasitas | Fitur |
|------|-------|-----------|-------|
| **Starter** | Rp 150.000/bulan | 1 cabang, 10 unit | Manajemen armada, booking, WA notif |
| **Pro** | Rp 350.000/bulan | 3 cabang, 50 unit | + GPS tracking, payment gateway, laporan |
| **Enterprise** | Rp 750.000/bulan | Unlimited cabang | + API akses, dedicated support, white-label |

**Trial:** 14 hari gratis tier Pro (✅ di-set saat bootstrap).

### Revenue Streams
- Subscription bulanan/tahunan → 🟡 Auto-billing belum aktif
- Fee transaksi opsional (1% per booking) → 🟡 Belum
- Setup fee → 🟡 Belum

---

## 4. Customer Segments

| Segmen | % Pasar | Kebutuhan MVP |
|--------|---------|---------------|
| **Segment A** — Perorangan (2-10 unit) | 60% | ✅ Sistem mudah, harga murah, dashboard HP |
| **Segment B** — Berkembang (10-50 unit) | 30% | ✅ Multi-cabang, report, role staff |
| **Segment C** — Besar (50+ unit) | 10% | 🟡 API akses, kustomisasi (post-MVP) |

---

## 5. Go-to-Market Strategy

| Phase | Aktivitas | Timeline | Status |
|-------|-----------|----------|--------|
| **Launch** — Target Segment A Jabodetabek | Komunitas WA rental mobil, Google Ads | Bulan 1-3 | 🟡 Menunggu rilis |
| **Growth** — Target Segment B+C nasional | Instagram/FB ads, referral program | Bulan 4-12 | ❌ Belum |
| **Scale** — Asia Tenggara | Partnership WA BSP, marketplace | Tahun 2+ | ❌ Belum |

---

## 6. Key Business Metrics

| Metrik | Target | Status |
|--------|--------|--------|
| MRR | Rp 50jt di bulan 12 | 🔴 Belum diukur |
| ARPU | Rp 250rb | 🔴 Belum diukur |
| CAC | < Rp 100rb | 🔴 Belum diukur |
| LTV:CAC | 30:1 | 🔴 Belum diukur |
| Churn Rate | <5% bulanan | 🔴 Belum diukur |
| TTV | < 7 hari | 🔴 Belum diukur |

---

## 7. Biaya Operasional (Estimasi Bulanan MVP)

| Item | Biaya |
|------|-------|
| Supabase Pro (database + auth + storage) | ~$25/bulan |
| VPS Cloudflare | ~$5-10/bulan (saat deploy) |
| Total (MVP) | ~$30-35/bulan |

---

## 8. Regulasi & Compliance

| Aspek | Status |
|-------|--------|
| UU PDP — consent, data deletion | 🟡 Belum (data KTP/SIM terenkripsi di storage privat) |
| Pajak — PPh Final, PPN | 🟡 Belum |
| Asuransi kendaraan | 🟡 Tracking dokumen siap |
| Syarat & Ketentuan digital | 🟡 Belum |
| KBLI 77100 / 49221 | 🟡 Belum |

---

## 9. Risk Analysis

| Risiko | Prob. | Dampak | Mitigasi | Status |
|--------|-------|--------|----------|--------|
| WA API blocked/delay | Medium | Tinggi | Fallback WA manual, multi-BSP | 🟡 Post-MVP |
| Competitor copy feature | Tinggi | Rendah | Fokus eksekusi & customer service | ✅ Aware |
| Churn tinggi | Medium | Tinggi | Onboarding baik, customer success | ❌ Belum |
| GPS device compatibility | Medium | Sedang | Abstract layer multi-provider | 🟡 Post-MVP |
| Security breach | Rendah | Sangat Tinggi | RLS, service-role terisolasi, Zod validasi | ✅ Layer 1 |
