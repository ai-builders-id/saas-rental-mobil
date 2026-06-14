# Roadmap — Aplikasi Tracking Mobil Rental

## Tahapan Menuju Production

---

## Phase 0: Foundation (Minggu 1-2)

### Setup
- [ ] Inisialisasi proyek Nuxt 4 dengan Nuxt UI 4
- [ ] Setup Tailwind CSS v4 + design tokens
- [ ] Konfigurasi ESLint, Prettier, TypeScript strict
- [ ] Setup PostgreSQL (via Docker)
- [ ] Setup Redis
- [ ] Setup Git + GitHub repository
- [ ] Setup GitHub Actions CI

### Deliverable
- Proyek Nuxt 4 dapat dijalankan (`bun dev`)
- Database terhubung
- Design system dasar berfungsi

---

## Phase 1: Core MVP (Minggu 3-6)

### Sprint 1: Auth & Tenant (Minggu 3)
- [ ] Halaman register, login, forgot password
- [ ] Multi-tenant middleware
- [ ] Tenant profile setup
- [ ] Subscription tier selection

### Sprint 2: Fleet Management (Minggu 4)
- [ ] CRUD kendaraan
- [ ] Status fleet automation
- [ ] Upload foto & dokumen (R2)
- [ ] Dashboard armada overview

### Sprint 3: Multi-Cabang (Minggu 5)
- [ ] CRUD cabang
- [ ] Transfer armada antar cabang
- [ ] Consolidated dashboard

### Sprint 4: Booking System (Minggu 6)
- [ ] Kalender booking
- [ ] Manual booking CRUD
- [ ] Status workflow (PENDING → CONFIRMED → ACTIVE → COMPLETED)
- [ ] Cegah overbooking

### Deliverable
- Owner dapat register + setup tenant
- CRUD armada + cabang
- Booking manual berfungsi
- **MVP siap demo ke 5 rental**

---

## Phase 2: Integrasi (Minggu 7-10)

### Sprint 5: WhatsApp Chatbot (Minggu 7-8)
- [ ] Setup WA Business API
- [ ] Webhook handler
- [ ] Chatbot flow: greeting → cek avail → quote → booking
- [ ] Kirim link payment via WA
- [ ] Notifikasi otomatis (reminder, overdue)

### Sprint 6: Payment Gateway (Minggu 9)
- [ ] Integrasi Midtrans Snap
- [ ] DP & pelunasan flow
- [ ] Deposit & refund
- [ ] Invoice auto-generate (PDF)
- [ ] Payment reconciliation

### Sprint 7: GPS Tracking (Minggu 10)
- [ ] Integrasi GPS provider API
- [ ] Real-time map view
- [ ] History playback
- [ ] Geofencing alerts

### Deliverable
- Booking via WA chatbot end-to-end
- Pembayaran terintegrasi
- GPS tracking real-time
- **Beta closed test — 20 tenant**

---

## Phase 3: Enhancement (Minggu 11-14)

### Sprint 8: Customer Management (Minggu 11)
- [ ] Database customer dengan KTP/SIM
- [ ] Verification system
- [ ] Blacklist
- [ ] Riwayat sewa

### Sprint 9: Reports (Minggu 12)
- [ ] Laporan operasional
- [ ] Laporan keuangan
- [ ] Export Excel/PDF
- [ ] Dashboard analytics

### Sprint 10: Staff Management (Minggu 13)
- [ ] Role-based access control
- [ ] Staff CRUD
- [ ] Activity log

### Sprint 11: Security & Polish (Minggu 14)
- [ ] Security audit
- [ ] Penetration testing
- [ ] Rate limiting
- [ ] Input validation & sanitasi
- [ ] Error handling improvement

### Deliverable
- Fitur lengkap
- Security audit passed
- **Public launch (GA)**

---

## Phase 4: Production & Scale (Minggu 15+)

### Sprint 12: Deployment (Minggu 15)
- [ ] Setup Cloudflare VPS
- [ ] Docker Compose production config
- [ ] Cloudflare Tunnel
- [ ] CI/CD pipeline
- [ ] SSL, domain, DNS
- [ ] Monitoring (Sentry, UptimeRobot)

### Sprint 13: Growth (Minggu 16-20)
- [ ] Referral program
- [ ] Landing page optimization
- [ ] SEO (blog, content)
- [ ] Onboarding flow improvement
- [ ] Performance optimization

### Post-MVP Features
- [ ] E-sign kontrak digital
- [ ] Mobile app (Flutter/React Native)
- [ ] Integrasi akuntansi
- [ ] AI predictive maintenance
- [ ] Multi-bahasa

---

## Timeline Visual

```
Minggu:  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20
        ┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐
Phase 0 │░░░░░││     ││     ││     ││     ││     ││     ││     ││     │
        └─────┘└─────┘└─────┘└─────┘└─────┘└─────┘└─────┘└─────┘└─────┘
Phase 1       │░░░░░░░░░░░░░░░│     │      │     │     │     │     │
              └───────────────┘     │      │     │     │     │     │
Phase 2                      │░░░░░░░░░░░░░░░░│     │     │     │     │
                              └────────────────┘     │     │     │     │
Phase 3                                       │░░░░░░░░░░░░░░░│     │
                                                └───────────────┘     │
Phase 4                                                         │░░░░░░░░░░░│
```
