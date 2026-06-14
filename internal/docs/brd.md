# Business Requirements Document (BRD)

## Aplikasi Tracking Mobil Rental — SaaS Platform

---

## 1. Ringkasan Bisnis

Platform SaaS yang menyediakan sistem manajemen armada, booking, pembayaran, dan tracking untuk bisnis rental mobil di Indonesia. Model bisnis subscription-based dengan target utama UMKM rental mobil (2-50 unit).

**Visi:** Menjadi sistem operasional standar untuk bisnis rental mobil di Indonesia.

**Misi:** Mentransformasi bisnis rental mobil Indonesia dari operasi manual ke digital terintegrasi.

---

## 2. Analisis Pasar

### 2.1 Ukuran Pasar

| Metrik | Nilai |
|--------|-------|
| Pasar rental mobil Indonesia (2026) | ~USD 1 miliar |
| Growth rate (CAGR) | 16% |
| Proyeksi 2031 | ~USD 2.1 miliar |
| Jumlah bisnis rental (estimasi) | 15.000 - 25.000 |
| Mayoritas | UMKM (2-50 unit) |

### 2.2 Tren Pasar 2026
- Adopsi GPS tracker sudah menjadi standar industri
- WhatsApp sebagai kanal komunikasi utama (95%+ bisnis)
- Multi-cabang semakin umum seiring ekspansi bisnis
- Pembayaran digital (QRIS, VA) sudah dominan
- Regulasi asuransi kendaraan mulai diwajibkan

### 2.3 Kompetitor

| Software | Kelebihan | Kekurangan |
|----------|-----------|------------|
| MyRental.id | Booking, WA integrasi, multi-cabang | UI kurang modern, harga tinggi |
| ScaleOcean | ERP lengkap | Terlalu kompleks untuk UMKM |
| INVLY.ID | POS, multi-cabang | Fokus retail, kurang untuk rental |
| Rentra | Sederhana, Android app | Fitur terbatas, tidak ada multi-cabang |
| SevenRent | All-in-one | Closed system, no API |

### 2.4 Diferensiasi Kami
- **WA Chatbot native** — bukan hanya notifikasi, tapi full booking flow
- **UI modern** — Nuxt UI 4, mobile-first, dark mode
- **Multi-cabang real-time** — satu dashboard semua cabang
- **Harga terjangkau** — mulai Rp 150-300rb/bulan
- **Cloudflare deployment** — latency rendah untuk Indonesia

---

## 3. Model Bisnis

### 3.1 Pricing Tiers

| Tier | Harga | Kapasitas | Fitur |
|------|-------|-----------|-------|
| **Starter** | Rp 150.000/bulan | 1 cabang, 10 unit | Manajemen armada, booking, WA notif |
| **Pro** | Rp 350.000/bulan | 3 cabang, 50 unit | + GPS tracking, payment gateway, laporan |
| **Enterprise** | Rp 750.000/bulan | Unlimited cabang | + API akses, dedicated support, white-label |

**Trial:** 14 hari gratis tier Pro (tanpa kartu kredit).

### 3.2 Revenue Streams
- Subscription bulanan/tahunan (disk 15% untuk tahunan)
- Fee transaksi opsional (1% per booking) untuk tier Starter
- Setup fee untuk custom integration (opsional)
- Hardware partnership (GPS device reseller)

### 3.3 Biaya Operasional (Estimasi Bulanan)

| Item | Biaya |
|------|-------|
| VPS Cloudflare | ~$20-50 |
| PostgreSQL (managed) | ~$30-100 |
| Redis | ~$15-30 |
| WA Business API | ~$0.005/pesan |
| Payment Gateway | 0-2% per transaksi |
| Cloudflare R2 | ~$5/100GB |
| Total (100 tenant) | ~$100-200/bulan |

---

## 4. Customer Segments

### Segment A: Rental Mobil Perorangan (2-10 unit)
- **Karakteristik:** Owner merangkap operator, 1 cabang, modal terbatas
- **Kebutuhan:** Yang penting ada sistem, harga murah, mudah dipakai
- **Tier cocok:** Starter
- **Estimasi jumlah:** 60% pasar

### Segment B: Rental Mobil Berkembang (10-50 unit)
- **Karakteristik:** Punya 2-3 cabang, ada staff, mulai serius
- **Kebutuhan:** WA otomatis, GPS tracking, laporan keuangan
- **Tier cocok:** Pro
- **Estimasi jumlah:** 30% pasar

### Segment C: Rental Mobil Besar (50+ unit)
- **Karakteristik:** Multi-cabang, tim IT internal
- **Kebutuhan:** API, kustomisasi, dedicated infra
- **Tier cocok:** Enterprise
- **Estimasi jumlah:** 10% pasar

---

## 5. Go-to-Market Strategy

### Phase 1: Launch (Bulan 1-3)
- **Target:** Rental kecil (Segment A) di Jabodetabek
- **Channel:** Komunitas WhatsApp rental mobil, Google Ads (keyword: "software rental mobil")
- **Promo:** Gratis 3 bulan untuk 50 tenant pertama
- **Pendekatan:** Direct sales via WA ke owner rental

### Phase 2: Growth (Bulan 4-12)
- **Target:** Segment B + C, nasional
- **Channel:** Instagram/FB ads, referral program (gratis 1 bulan per referral), content marketing
- **Partnership:** Integrasi dengan GPS provider, lobi asosiasi rental (APRINDO)
- **Event:** Pameran otomotif lokal

### Phase 3: Scale (Tahun 2+)
- **Target:** Asia Tenggara
- **Channel:** Partnership with WA BSP, marketplace integration
- **Product:** Mobile app, multi-language

---

## 6. Key Business Metrics

| Metrik | Cara Ukur | Target |
|--------|-----------|--------|
| MRR (Monthly Recurring Revenue) | Total subscription per bulan | Rp 50jt di bulan 12 |
| ARPU (Average Revenue Per User) | MRR / total tenant | Rp 250rb |
| CAC (Customer Acquisition Cost) | Total marketing / new tenant | < Rp 100rb |
| LTV (Lifetime Value) | ARPU × avg months retained | Rp 3jt+ |
| LTV:CAC Ratio | LTV / CAC | 30:1 |
| Churn Rate | Tenant lost / total tenant | <5% bulanan |
| Time to Value (TTV) | Registrasi → booking pertama | < 7 hari |

---

## 7. Regulatory & Compliance

| Aspek | Kebutuhan |
|-------|-----------|
| **Perlindungan Data Pribadi (UU PDP)** | Wajib — implementasi consent, data encryption, data deletion on request |
| **Pajak** | Laporan PPh Final (UMKM), PPN untuk korporasi. Integrasi output pajak. |
| **KBLI** | Tenant harus punya NIB dengan KBLI 77100 (sewa mobil lepas kunci) dan/atau 49221 (dengan sopir) |
| **Asuransi** | Platform perlu fitur tracking polis asuransi kendaraan per unit |
| **Syarat & Ketentuan** | Perjanjian sewa digital yang sah secara hukum |

---

## 8. Risk Analysis

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| WA API blocked/delay | Medium | Tinggi | Fallback ke WA manual, multi-BSP |
| Competitor copy feature | Tinggi | Rendah | Fokus pada eksekusi & customer service |
| Churn tinggi | Medium | Tinggi | Onboarding yang baik, customer success |
| GPS device compatibility | Medium | Sedang | Abstract layer untuk multi-provider |
| Regulasi berubah | Rendah | Medium | Arsitektur fleksibel, update cepat |
| Security breach | Rendah | Sangat Tinggi | Audit rutin, encryption, Cloudflare WAF |
