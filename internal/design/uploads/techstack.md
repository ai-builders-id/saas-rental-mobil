# Tech Stack — Aplikasi Tracking Mobil Rental

---

## 1. Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Nuxt** | 4.x (latest) | SSR/SSG framework, file-based routing, auto-imports |
| **Vue** | 3.x | UI framework (bundled with Nuxt) |
| **Nuxt UI** | 4.8+ | Component library (125+ components, MIT) |
| **Tailwind CSS** | v4 | Utility-first CSS, `@theme` directive |
| **TypeScript** | 5.x | Type safety |
| **VueUse** | latest | Composables library |
| **Zod** | latest | Runtime validation (shared with server) |

### Nuxt 4 Configuration

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  compatibilityVersion: 4,

  nitro: {
    preset: 'cloudflare',  // Cloudflare Workers deployment
  },

  routeRules: {
    '/': { prerender: true },
    '/dashboard/**': { ssr: false },
    '/api/**': { cors: true },
  },

  css: ['~/assets/css/main.css'],
})
```

### Directory Structure
```
app/
├── assets/css/main.css       # Tailwind + Nuxt UI + design tokens
├── components/               # Auto-imported Vue components
├── composables/              # Auto-imported composables
├── layouts/                  # App layouts
├── pages/                    # File-based routes
├── plugins/                  # Vue plugins
├── utils/                    # Utility functions
├── app.config.ts             # Runtime config (theme, UI)
└── app.vue                   # Root component

server/
├── api/                      # API route handlers
├── middleware/                # Server middleware
├── plugins/                  # Nitro plugins
└── utils/                    # Server-side utilities

shared/
├── types/                    # TypeScript types
├── validators/               # Zod schemas
└── constants/                # Shared constants
```

---

## 2. Backend & API

| Technology | Purpose |
|-----------|---------|
| **Nitro** (Nuxt 4 built-in) | Server engine — handles API routes, middleware, SSR |
| **PostgreSQL** 16 | Primary database |
| **Redis** 7 | Caching, session store, queue, real-time pub/sub |
| **Drizzle ORM** | TypeScript-first SQL ORM (type-safe, lightweight) |

> **Why Nitro over separate backend?** Nuxt 4's Nitro server provides:
> - Unified deployment (one app to deploy)
> - Shared TypeScript types between frontend and API
> - Auto-imported server utilities
> - Native WebSocket support
> - Multiple deployment presets (Cloudflare, Node, etc.)

---

## 3. External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Midtrans** | Payment gateway (QRIS, VA, e-wallet, CC) | Server API + Snap redirect |
| **Xendit** | Backup payment gateway | Server API |
| **WhatsApp Business API** | Chatbot, notifications | Webhook + API (via BSP) |
| **GPS Provider API** | Real-time vehicle tracking | REST API (polling every 30s) |
| **Cloudflare R2** | File storage (KTP, SIM, photos) | S3-compatible API |
| **Sentry** | Error tracking & monitoring | SDK |
| **Google Maps** | Map display, geocoding | JavaScript API |

---

## 4. DevOps & Infrastructure

| Tool | Purpose |
|------|---------|
| **Cloudflare VPS** | Hosting |
| **Cloudflare Tunnel** | Secure ingress (no open ports) |
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **GitHub Actions** | CI/CD |
| **GitHub** | Version control |

### Docker Compose Production Setup
```yaml
services:
  app:
    build: .
    env_file: .env
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

volumes:
  pgdata:
```

---

## 5. Development Tools

| Tool | Purpose |
|------|---------|
| **Bun** | JavaScript runtime & package manager |
| **VS Code** | Primary editor |
| **Vue DevTools** | Vue/Nuxt debugging |
| **PgAdmin** | Database management |
| **Redis Insight** | Redis management |

---

## 6. Key Libraries

| Package | Purpose |
|---------|---------|
| `@nuxt/ui` | UI components + design system |
| `@nuxtjs/color-mode` | Dark/light mode |
| `nuxt-icon` | Icon system (auto-imported) |
| `drizzle-orm` | Database ORM |
| `drizzle-kit` | Migration tool |
| `zod` | Schema validation (shared) |
| `@vueuse/core` | Vue composables collection |
| `bullmq` | Job queue (Redis-based) |
| `socket.io` / `@vueuse/integrations` | WebSocket real-time |
| `midtrans-client` | Payment gateway |
| `date-fns` | Date manipulation |

---

## 7. Why These Choices?

| Decision | Rationale |
|----------|-----------|
| **Nuxt 4** | SSR for SEO, file-based routing, Nitro unified backend, Cloudflare preset |
| **Nuxt UI 4** | 125+ components, MIT open source, design tokens, dark mode, Tailwind v4 |
| **Drizzle ORM** | Type-safe, lightweight, SQL-like syntax, great DX with migrations |
| **PostgreSQL** | Reliable, feature-rich, JSON support, great for transactional data |
| **Redis** | Speed for real-time GPS, session store, job queue, pub/sub |
| **Cloudflare Tunnel** | Zero-trust ingress, no open ports, DDoS protection, WAF |
| **Midtrans** | Dominant payment gateway in Indonesia, comprehensive method support |
