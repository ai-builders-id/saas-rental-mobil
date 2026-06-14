# Blueprint — Aplikasi Tracking Mobil Rental

## 1. System Overview

Platform SaaS multi-tenant untuk bisnis rental mobil di Indonesia. Satu platform terpusat yang melayani banyak bisnis rental (tenant), masing-masing dengan data terisolasi.

**Core Capabilities:**
- Fleet tracking real-time (status: disewa/ready/maintenance)
- Multi-cabang management
- Booking & reservation via WhatsApp chatbot
- Payment & verification integration
- GPS tracking integration
- Subscription-based billing

---

## 2. Architecture

### High-Level Architecture

```
[Cloudflare VPS]
    ├── Nuxt 4 (SSR) — Frontend + API Server (Nitro)
    ├── PostgreSQL — Primary Database
    ├── Redis — Cache + Queue + Real-time
    └── Nginx — Reverse Proxy (Cloudflare Tunnel)

[External Services]
    ├── Midtrans/Xendit — Payment Gateway
    ├── WhatsApp Business API — Chatbot Booking
    ├── GPS Provider API — Fleet Tracking
    └── Cloudflare R2 — File Storage (KTP, SIM, foto mobil)
```

### Architecture Pattern

**Monolith-first with modular boundaries.** Nuxt 4 + Nitro server handles both frontend and API. Separated into domain modules:

```
app/
├── components/          # Shared UI components
│   ├── rental/          # Rental-specific components
│   ├── fleet/           # Fleet management components
│   ├── booking/         # Booking-related components
│   ├── branch/          # Branch management components
│   └── dashboard/       # Dashboard widgets
├── composables/         # Shared composables
├── layouts/             # App layouts
├── middleware/          # Route middleware
├── pages/              # File-based routes
│   ├── dashboard/       # Owner dashboard
│   ├── fleet/           # Fleet management
│   ├── bookings/        # Booking management
│   ├── branches/        # Branch management
│   ├── customers/       # Customer management
│   ├── reports/         # Reports & analytics
│   └── settings/        # Tenant settings
├── plugins/             # Vue plugins
└── utils/               # Utility functions

server/
├── api/                 # API route handlers
│   ├── auth/            # Authentication
│   ├── tenants/         # Multi-tenant management
│   ├── fleet/           # Fleet CRUD + status
│   ├── bookings/        # Booking CRUD
│   ├── branches/        # Branch management
│   ├── customers/       # Customer data
│   ├── payments/        # Payment processing
│   ├── whatsapp/        # WhatsApp webhook
│   ├── gps/             # GPS tracking data
│   └── reports/         # Report generation
├── middleware/           # Server middleware (auth, tenant resolution)
└── plugins/             # Nitro plugins

shared/                  # Isomorphic code
├── types/               # TypeScript types
├── validators/          # Zod validation schemas
└── constants/           # Shared constants
```

---

## 3. Data Model

### Core Entities

```
Tenant (Bisnis Rental)
├── Branches (Cabang)
│   ├── Fleet (Armada)
│   │   ├── Vehicles (Mobil)
│   │   ├── GPS Devices
│   │   └── Maintenance Records
│   ├── Staff (Karyawan)
│   └── Inventory
├── Customers
│   ├── Rentals (Sewa)
│   │   ├── Payments
│   │   ├── Inspections
│   │   └── Insurance Claims
│   └── Communications (WA)
├── Bookings
│   ├── WhatsApp Conversations
│   ├── Quotes
│   ├── Payments
│   └── Contracts
└── Subscriptions
    ├── Invoices
    └── Usage Records
```

### Key Relationships

- **Tenant** has many **Branches**
- **Branch** has many **Vehicles**
- **Vehicle** has many **RentalRecords**
- **Vehicle** has one **GPSDevice**
- **Customer** has many **RentalRecords**
- **RentalRecord** has one **Payment**
- **RentalRecord** has one **Inspection** (check-in) and one **Inspection** (check-out)
- **Booking** comes from **WhatsAppConversation**
- **Booking** becomes **RentalRecord** after payment + pickup

---

## 4. Multi-Tenant Strategy

**Row-level isolation** (single database, tenant_id on every table):

```sql
-- Every tenant-scoped table has tenant_id
CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    branch_id UUID REFERENCES branches(id),
    -- ... other fields
);

-- Row-Level Security (RLS) via server middleware
-- All API routes resolve tenant from JWT claim
```

**Tenant resolution flow:**
1. Owner registers → tenant created + subscription tier assigned
2. Owner logs in → JWT contains `tenant_id`
3. Every API request → middleware extracts `tenant_id` from JWT
4. All queries filter by `tenant_id`

---

## 5. Key Flows

### Booking Flow (via WhatsApp)

```
Customer WA → Chatbot → Cek Availabilitas → Kirim Quote
    → Customer Setuju → Minta Data + KTP → Verifikasi
    → Kirim Link DP (30-50%) → DP Masuk → Booking Dikonfirmasi
    → WA Notification ke Owner → Kalender Terblokir
```

### Pickup Flow

```
Customer Datang → Verifikasi KTP/SIM → Inspeksi Mobil (foto 8 sisi)
    → Tanda Tangan Digital → Pelunasan + Deposit → Kunci Dibuka
    → Status: ON RENT → GPS Tracking Aktif
```

### Return Flow

```
Customer Kembali → Inspeksi Mobil (foto 8 sisi)
    → Bandingkan dengan Foto Checkout
    → Jika Rusak → Proses Klaim Asuransi
    → Jika OK → Refund Deposit → Status: AVAILABLE
    → Masuk Antrian Cuci & Servis
```

### Fleet Status Lifecycle

```
AVAILABLE → BOOKED → ON_RENT → RETURNED → INSPECTION → AVAILABLE
                                                    → MAINTENANCE → AVAILABLE
```

---

## 6. Real-Time Architecture

### GPS Tracking
- GPS devices push location data via API every 30-60 seconds
- Server validates and stores in Redis sorted sets (latest position per vehicle)
- Frontend subscribes via WebSocket (Nuxt built-in via Nitro)
- Geofencing alerts when vehicle leaves designated area

### WhatsApp Webhook
- WA Business API sends incoming messages to server webhook
- Server processes via queue (Bull/BullMQ on Redis)
- Chatbot logic processes intents and responds
- Human handoff when chatbot cannot resolve

---

## 7. API Design

RESTful API under `/api/*` served by Nitro server:

```
GET    /api/fleet                    — List vehicles
POST   /api/fleet                    — Add vehicle
GET    /api/fleet/:id                — Vehicle detail
PATCH  /api/fleet/:id/status         — Update status
POST   /api/fleet/:id/maintenance    — Schedule maintenance

GET    /api/bookings                 — List bookings
POST   /api/bookings                 — Create booking
PATCH  /api/bookings/:id/status      — Update status
POST   /api/bookings/:id/payment     — Register payment

GET    /api/customers                — List customers
POST   /api/customers                — Register customer
GET    /api/customers/:id/rentals    — Customer rental history

GET    /api/branches                 — List branches
POST   /api/branches                 — Add branch
POST   /api/branches/:id/transfer    — Transfer vehicle between branches

POST   /api/whatsapp/webhook         — WA incoming message
GET    /api/gps/vehicles/:id/location — Latest GPS position
```

---

## 8. Security Boundaries

```
[Public]
    ├── /api/auth/* — Login, Register, Verify
    ├── /api/whatsapp/webhook — WA webhook (IP whitelist)
    └── /api/gps/* — GPS data ingress (API key per device)

[Authenticated — Owner]
    ├── /api/fleet/* — Fleet CRUD
    ├── /api/bookings/* — Booking management
    ├── /api/branches/* — Branch management
    ├── /api/customers/* — Customer management
    ├── /api/reports/* — Reports & analytics
    └── /api/settings/* — Tenant settings

[Authenticated — Staff]
    └── Subset based on role (operator, admin, viewer)
```

---

## 9. Data Flow Diagram

```
                  ┌─────────────┐
                  │  WhatsApp   │
                  │   Client    │
                  └──────┬──────┘
                         │ WA API
                         ▼
                  ┌─────────────┐
                  │  WA BSP     │
                  │  Webhook    │
                  └──────┬──────┘
                         │
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Chatbot  │  │ Payment  │  │  Owner   │
    │ Service  │  │ Gateway  │  │ Dashboard│
    └────┬─────┘  └────┬─────┘  └────┬─────┘
         │              │             │
         └──────────────┼─────────────┘
                        ▼
                 ┌──────────────┐
                 │   Nitro API  │
                 │   Server     │
                 └──────┬───────┘
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │PostgreSQL│  │  Redis   │  │   R2     │
   │ Primary  │  │ Cache/WS │  │ Storage  │
   └──────────┘  └──────────┘  └──────────┘
```

---

## 10. Deployment Architecture (Cloudflare)

```
[Cloudflare VPS]
    ├── Docker Compose
    │   ├── nuxt-app (Node.js 22) — SSR + API
    │   ├── postgres:16
    │   ├── redis:7
    │   └── nginx (optional, if not using CF Tunnel)
    │
    ├── Cloudflare Tunnel (cloudflared)
    │   ├── Public → VPS (no open ports needed)
    │   └── DDoS protection, WAF, caching
    │
    └── CI/CD via GitHub Actions
        └── Deploy on push to main branch
```

**Scaling strategy:**
- Horizontal: Multiple Nuxt instances behind load balancer
- Database: Read replicas for reporting queries
- Cache: Redis cluster for real-time GPS data
- File storage: Cloudflare R2 for images/documents
