# Security Document — Aplikasi Tracking Mobil Rental

## Security Architecture & Implementation Guide — MVP Iterasi 1

---

## 1. Threat Model

### Assets (MVP)
- User credentials & authentication tokens — ✅ Supabase Auth
- Tenant business data — ✅ tenant_id isolation via Drizzle
- Payment data — 🟡 Stub (data tersimpan di DB karena belum gateway nyata)
- Personal data (KTP, SIM via storage) — ✅ Bucket privat + signed URL pattern
- GPS location data — 🟡 Stub (data tiruan)

### Threat Actors

| Actor | Mitigasi MVP |
|-------|-------------|
| Unauthenticated user | ✅ Auth middleware + Supabase JWT |
| Malicious tenant | ✅ tenant_id filter di SEMUA query + RLS defense-in-depth |
| Disgruntled employee | ✅ Role-based guard (requireRole / requireMinRole) |
| Organized crime | 🟡 Belum (Cloudflare WAF, audit log: post-MVP) |

---

## 2. Authentication & Authorization

### Password Policy ✅ (delegasi ke Supabase Auth)
- Minimum 6 characters (Supabase default)
- bcrypt hashing (Supabase internal)
- Rate limiting: Supabase Auth handles brute force
- Session invalidation on password change: ✅ Supabase

### JWT Token Management ✅ (delegasi ke Supabase Auth)
- Access token: 1 hour (Supabase default)
- Refresh token: Rotate on use
- Stored in HTTP-only, Secure, SameSite cookies
- Token revocation on logout: ✅

### Multi-Tenant Isolation ✅
| Layer | Mekanisme |
|-------|-----------|
| **Application** (Drizzle) | Setiap query filter `tenant_id` dari `event.context.auth` |
| **RLS** (Postgres) | Policy `USING (tenant_id = private.current_tenant_id())` untuk defense-in-depth |
| **Service role** | Hanya dipakai di middleware/auth untuk ambil profil; semua endpoint bisnis pakai koneksi langsung (bypass RLS — aman karena filter manual) |

---

## 3. Data Protection

| Layer | Method | Status |
|-------|--------|--------|
| In transit (client → server) | TLS (development HTTP, production via Cloudflare) | 🟡 Dev |
| In transit (server → database) | SSL (Supabase) | ✅ |
| At rest (database) | Supabase TDE | ✅ |
| At rest (file storage) | Supabase Storage encryption | ✅ |
| PII fields (KTP, SIM) | Akses via signed URL, file di bucket privat | ✅ |
| Passwords | bcrypt via Supabase Auth | ✅ |

### Data Classification MVP

| Classification | Examples | Mitigasi |
|---------------|----------|----------|
| Public | Tenant name, vehicle make/model | Tidak dilindungi khusus |
| Internal | Plate numbers, pricing | Filter tenant_id |
| Confidential | Customer names, phone numbers | tenant_id filter + bucket privat |
| Restricted | KTP/SIM photos | Bucket privat + signed URL (belum diimplementasi) |
| Regulated | Payment data | Belum ada gateway nyata |

---

## 4. API Security

### Implementasi MVP
- ✅ Zod schema validation di semua endpoint (create/update/query)
- ✅ SQL injection prevention via Drizzle parameterized queries
- ✅ Request validation: `readValidatedBody`, `getValidatedQuery`
- ✅ Input sanitization — Zod trim + type enforcement
- 🟡 Rate limiting — belum (perlu middleware)
- 🟡 CORS — via Nuxt `routeRules: {'/api/**': { cors: true }}`
- ❌ CSRF — Nuxt internal, perlu konfigurasi

### Rate Limiting (target — belum implementasi)

| Endpoint | Target Limit |
|----------|-------------|
| Auth | 5 req/min per IP |
| API general | 60 req/min per tenant |
| File upload | 10 req/min per tenant |

---

## 5. Infrastructure Security (Target Produksi)

### Saat Ini (Dev)
- ✅ Supabase Cloud — managed security
- 🟡 No open ports — hanya localhost:3000
- ❌ Docker — belum

### Target Produksi
- Cloudflare VPS + Tunnel: zero-trust ingress
- WAF rules: SQL injection, XSS, RCE
- Docker: non-root user, read-only filesystem
- Supabase: SSL required, backup belum

---

## 6. Secure Development

### MVP
- ✅ TypeScript strict mode
- ✅ Dependency scanning via `npm audit`
- ✅ Separate env: `.env` (gitignored), `.env.example` (committed)
- ✅ Service role key hanya di server (`NUXT_SUPABASE_SERVICE_KEY`)

### Target
- ❌ SAST (SonarQube / CodeQL)
- ❌ Dependabot / Renovate
- ❌ Code review wajib
- ❌ Container scanning (Trivy)

---

## 7. Incident Response (Target — Belum)

| Level | Definition | Response Time |
|-------|-----------|-------------|
| SEV-1 | Data breach, service outage | 15 min |
| SEV-2 | Suspicious activity | 1 hour |
| SEV-3 | Minor issue | 24 hours |

---

## 8. Compliance Checklist (MVP)

| Requirement | Status | Notes |
|------------|--------|-------|
| UU PDP consent | 🟡 | Checklist: `checklist.md#5-compliance--kepatuhan` |
| ISO 27001 | ❌ | Post-MVP |
| PCI DSS | N/A | Payment via gateway nanti |
| WCAG 2.1 AA | 🟡 | Nuxt UI 4 built-in a11y — belum diaudit |

---

## 9. Security Testing (Target)

| Type | Frequency | Status |
|------|-----------|--------|
| Dependency scan | Weekly | ❌ |
| SAST | Every PR | ❌ |
| Penetration test | Quarterly | ❌ |

---

## 10. Checklist Sekuritas Implementasi MVP

> Checklist keamanan lengkap telah dipindahkan ke `checklist.md#43-security`.
> Di bawah ini ringkasan status:

- ✅ SQL injection prevention, input validation, auth middleware
- ✅ Tenant isolation, RLS, role-based access
- ✅ Service role terisolasi, storage bucket privat
- ❌ Rate limiting, audit log, data deletion API, signed URL — belum
