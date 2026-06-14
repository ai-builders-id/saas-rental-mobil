# Functional Requirements Document (FRD)

## Aplikasi Tracking Mobil Rental — SaaS Platform

---

## 1. Authentication & Authorization

### FR-01: User Registration
- Owner register via email + password
- Verifikasi email wajib sebelum login
- Auto-create tenant profile on registration
- Pilih subscription tier saat registrasi
- Trial 14 hari otomatis aktif

### FR-02: User Login
- Login via email + password
- OAuth 2.0 (Google) opsional
- "Remember me" cookie (30 hari)
- Rate limiting: max 5 percobaan gagal per 15 menit

### FR-03: Role-Based Access Control
| Role | Akses |
|------|-------|
| **Owner** | Full access — semua fitur, cabang, laporan |
| **Admin** | Operasional — booking, fleet, customers, staff |
| **Operator** | Terbatas — pickup/return check-in, fleet status |
| **Viewer** | Read-only — laporan & dashboard |

### FR-04: Password Management
- Reset password via email link
- Password policy: min 8 chars, kombinasi huruf+angka
- Hash: bcrypt

---

## 2. Tenant Management

### FR-05: Tenant Profile
- Nama bisnis, alamat, no telepon, email
- Logo perusahaan (upload)
- Timezone & currency (IDR default)
- Nomor WA bisnis terverifikasi

### FR-06: Subscription Management
- Lihat current tier & billing cycle
- Upgrade/downgrade tier
- Invoice history
- Cancel subscription (grace period 30 hari)
- Data retention: 90 hari setelah cancel

### FR-07: Staff Management
- CRUD staff per tenant
- Assign role (admin/operator/viewer)
- Aktivasi/deaktivasi akun staff

---

## 3. Fleet Management

### FR-08: Vehicle CRUD
| Field | Tipe | Wajib |
|-------|------|-------|
| Merk | String | Ya |
| Model | String | Ya |
| Tahun | Number | Ya |
| Plat Nomor | String | Ya |
| Warna | String | Ya |
| Foto | Image[] | Ya |
| STNK File | File | Ya |
| Harga Sewa/Hari | Number | Ya |
| Harga Sewa/Minggu | Number | Opsional |
| Harga Sewa/Bulan | Number | Opsional |
| Harga Dengan Sopir | Number | Opsional |
| Status | Enum | Auto |
| Cabang | UUID | Ya |

### FR-09: Fleet Status Automation
- **AVAILABLE** → Default saat ditambahkan / selesai return
- **BOOKED** → Saat booking dikonfirmasi (DP masuk)
- **ON_RENT** → Saat pickup dilakukan
- **INSPECTION** → Saat return, menunggu pengecekan
- **MAINTENANCE** → Manual di-set owner/staff

### FR-10: Maintenance Schedule
- Jadwal servis berkala (by KM atau tanggal)
- Reminder H-7, H-1 via dashboard & WA
- Riwayat maintenance (bengkel, biaya, catatan)
- Status MAINTENANCE otomatis saat jadwal servis tiba

### FR-11: Document Management
- Upload STNK, BPKB, asuransi per kendaraan
- Expiry reminder (STNK mati, asuransi habis)
- Riwayat dokumen versi

---

## 4. Branch Management

### FR-12: Branch CRUD
- Nama cabang, alamat, kontak, jam operasional
- Peta lokasi (Google Maps pin)
- Foto cabang
- Status: ACTIVE / INACTIVE

### FR-13: Fleet Transfer
- Pilih kendaraan → pilih cabang tujuan
- Catat tanggal transfer
- Status kendaraan otomatis pindah cabang
- Riwayat perpindahan

### FR-14: Consolidated Dashboard
- Ringkasan semua cabang dalam satu view
- Filter per cabang
- Perbandingan performa antar cabang

---

## 5. Booking & Reservation

### FR-15: Manual Booking (via Dashboard)
- Pilih kendaraan → date range → customer
- Auto-check ketersediaan (cegah overbooking)
- Harga otomatis dihitung (termasuk driver, denda)
- Status: PENDING → CONFIRMED (DP) → ACTIVE (pickup) → COMPLETED (return)

### FR-16: WhatsApp Booking Flow
1. Customer kirim pesan ke nomor WA tenant
2. Chatbot: "Halo! Silakan pilih mobil yang ingin disewa..."
3. Customer pilih mobil → chatbot cek availability
4. Chatbot kirim quote (harga + biaya tambahan)
5. Customer setuju → chatbot minta: nama, no HP, foto KTP
6. Chatbot kirim link pembayaran DP
7. Pembayaran masuk → booking confirmed
8. Chatbot kirim: "Booking Anda sudah dikonfirmasi! Silakan datang ke [alamat] untuk pickup."

### FR-17: Calendar View
- Tampilan kalender bulanan/mingguan
- Drag & drop untuk reschedule
- Warna berbeda per status
- Filter per cabang, per kendaraan

### FR-18: Pricing & Discount
- Harga dasar per durasi (harian/mingguan/bulanan)
- Biaya tambahan: driver, antar jemput, tambahan KM
- Denda: keterlambatan, rokok, kotor berlebihan
- Promo diskon (persentase / nominal)
- Blackout dates (hari libur nasional high season)

---

## 6. Customer Management

### FR-19: Customer Database
- Nama, no HP, email, alamat
- Foto KTP & SIM (upload, encrypted storage)
- Riwayat sewa
- Rating (otomatis dari jumlah sewa, keterlambatan)
- Blacklist flag + alasan

### FR-20: Customer Verification
- Verifikasi no HP via OTP WA
- OCR KTP (opsional, post-MVP)
- Face match (selfie vs KTP) — post-MVP
- Blacklist check otomatis saat booking

---

## 7. Payment

### FR-21: Payment Gateway Integration
- Integrasi Midtrans (prioritas) + Xendit (backup)
- Payment methods: QRIS, Virtual Account (BCA/Mandiri/BRI/BNI), GoPay, OVO, DANA, Kartu Kredit
- Snap URL / redirect payment page

### FR-22: Payment Flow
- DP 30-50% saat booking
- Sisa pelunasan + deposit saat pickup
- Refund deposit saat return (jika tidak ada masalah)
- Denda dipotong dari deposit

### FR-23: Invoice
- Auto-generate invoice PDF
- Invoice number format: INV-{TENANT}-{YYYYMM}-{XXXX}
- Invoice via WA & email
- Riwayat invoice

### FR-24: Reconciliation
- Status payment: PENDING / SETTLED / EXPIRED / REFUND
- Daily auto-reconciliation
- Manual match jika ada selisih

---

## 8. GPS Tracking

### FR-25: Real-Time Location
- Map view (Google Maps) dengan marker semua unit
- Cluster untuk zoom out
- Warna marker sesuai status (hijau=available, biru=on rent, merah=maintenance)
- Update posisi setiap 30-60 detik

### FR-26: GPS History
- Playback rute perjalanan
- Total KM perjalanan
- Durasi perjalanan
- Export history (KML/GPX)

### FR-27: Geofencing
- Buat zona geografis (lingkaran/polygon)
- Alert saat kendaraan masuk/keluar zona
- Notifikasi WA ke owner

### FR-28: Speed & Behavior Monitoring
- Alert kecepatan > batas (misal 120 km/jam)
- Alert waktu berhenti lama ( > 2 jam di lokasi tidak dikenal)
- Engine cut-off (via GPS hardware — post-MVP)

---

## 9. WhatsApp Integration

### FR-29: WhatsApp Business API
- Register & verifikasi nomor WA tenant
- Kirim template messages (disetujui Meta)
- Webhook handler untuk incoming messages

### FR-30: Chatbot Conversation Flow
| Intent | Action |
|--------|--------|
| Greeting | Kirim sapaan + menu utama |
| Cek mobil | Tampilkan daftar mobil + harga |
| Booking | Mulai flow booking |
| Cek status | Cek status booking aktif |
| Bantuan | Human handoff |

### FR-31: Automated Notifications
| Event | WA Notification |
|-------|----------------|
| Booking confirmed | Detail booking + link invoice |
| H-1 reminder | "Besok jadwal pickup Anda..." |
| Pickup done | "Mobil sudah diambil. Selamat berkendara!" |
| Return reminder | "Besok jadwal kembali. Lokasi: ..." |
| Payment received | "Pembayaran Rp X sudah diterima." |
| Maintenance due | "Mobil X jadwal servis besok." |

---

## 10. Reports & Analytics

### FR-32: Operational Reports
- Fleet utilization rate
- Booking summary (per hari/minggu/bulan)
- Revenue report (per cabang, per kendaraan)
- Top customers by frequency/revenue
- Maintenance cost report

### FR-33: Financial Reports
- P&L summary
- Revenue vs target
- Outstanding payments
- Tax report (PPh, PPN)

### FR-34: Export
- Export to Excel/CSV/PDF
- Scheduled report (email otomatis setiap Senin)
- Custom date range

---

## 11. System Requirements

### FR-35: Multi-Language
- Bahasa Indonesia (default)
- Framework i18n ready untuk ekspansi

### FR-36: Mobile Responsive
- Mobile-first design (Nuxt UI 4 responsive)
- Dashboard functional di layar HP 360px+
- Touch-friendly UI

### FR-37: Performance
- SSR untuk pages utama (SEO)
- CS untuk dashboard (interaktif)
- Page load < 2 detik (3G)
- Time to Interactive < 3 detik

### FR-38: Backup & Recovery
- Daily database backup (otomatis)
- RPO (Recovery Point Objective): 24 jam
- RTO (Recovery Time Objective): 4 jam
- Backup retention: 30 hari
