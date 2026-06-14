# Security Document — Aplikasi Tracking Mobil Rental

## Security Architecture & Implementation Guide

---

## 1. Threat Model

### Assets
- User credentials & authentication tokens
- Tenant business data (fleets, customers, bookings)
- Payment data (processed by gateway, not stored)
- Personal data (KTP, SIM, phone numbers) — regulated by UU PDP
- GPS location data (real-time & history)

### Threat Actors

| Actor | Capability | Target |
|-------|-----------|--------|
| Unauthenticated user | Internet access | Auth bypass, data scraping |
| Malicious tenant | Valid credentials | Access other tenant data |
| Disgruntled employee | Internal network access | Data exfiltration, sabotage |
| Organized crime | Advanced persistent threat | Customer PII, financial data |
| Competitor | Internet access | Pricing data, customer lists |

---

## 2. Authentication & Authorization

### Password Policy
- Minimum 8 characters, mixed case + number
- bcrypt hashing (cost factor 12)
- Rate limiting: 5 failed attempts → 15 min lockout
- No password storage in plaintext anywhere
- Session invalidation on password change

### JWT Token Management
- Access token: 15 minutes (short-lived)
- Refresh token: 7 days (rotate on use)
- Stored in HTTP-only, Secure, SameSite=Strict cookies
- CSRF token for state-changing requests
- Token revocation on logout (server-side blacklist via Redis)

### Multi-Tenant Isolation
- `tenant_id` in JWT — server-verified on every request
- RBAC enforced in server middleware
- All queries include `WHERE tenant_id = :current_tenant`
- RLS-ready schema design

---

## 3. Data Protection

### Encryption
| Layer | Method |
|-------|--------|
| In transit (client → server) | TLS 1.3 (Cloudflare) |
| In transit (server → database) | TLS (PostgreSQL) |
| At rest (database) | Transparent Data Encryption (TDE) |
| At rest (file storage) | AES-256 (R2 server-side encryption) |
| PII fields (KTP, SIM, phone) | Column-level encryption (AES-256-GCM) |
| Passwords | bcrypt |

### Data Classification

| Classification | Examples | Storage |
|---------------|----------|---------|
| Public | Tenant name, vehicle make/model | Standard |
| Internal | Vehicle plate numbers, pricing | Standard |
| Confidential | Customer names, phone numbers | Encrypted |
| Restricted | KTP photos, SIM photos | Encrypted + Access Logged |
| Regulated | Payment data | Not stored (processed by gateway) |

---

## 4. API Security

### Request Validation
- Zod schema validation on all API endpoints
- Input sanitization (XSS prevention)
- SQL injection prevention via parameterized queries
- Content-Type enforcement (application/json)
- Request size limits (1MB default, 10MB for file uploads)

### Rate Limiting
| Endpoint | Limit |
|----------|-------|
| Auth (login, register) | 5 req/min per IP |
| API general | 60 req/min per tenant |
| GPS data ingress | 300 req/min per device |
| File upload | 10 req/min per tenant |
| WhatsApp webhook | 100 req/min per IP |

### CORS Configuration
- Strict origin whitelist (no wildcard)
- Credentials only for tenant's own domain
- Preflight cache: 24 hours

---

## 5. Infrastructure Security

### Cloudflare VPS
- No open ports except via Cloudflare Tunnel
- WAF rules: SQL injection, XSS, RCE, path traversal
- DDoS protection (automatic)
- Bot fight mode
- IP reputation blocking

### Docker
- Non-root user for containers
- Read-only root filesystem where possible
- Resource limits (CPU, memory) per container
- Image scanning (Trivy) in CI/CD
- Secrets via environment (never in image)

### PostgreSQL
- Separate user per service (no superuser for app)
- Network policy: only app server can connect
- SSL required
- Automated backup (pg_dump) to R2
- Backup encryption

### Redis
- Password authentication
- Bind to localhost only
- Keyspace notification (no sensitive data in keys)

---

## 6. Secure Development

### CI/CD Pipeline
- SAST scanning (SonarQube / CodeQL)
- Dependency vulnerability scanning (Snyk / npm audit)
- Secrets scanning (git leaks prevention)
- Docker image vulnerability scanning (Trivy)
- Mandatory code review for all PRs

### Dependency Management
- Regular `npm audit` & `bun update`
- Renovate/Dependabot for automated updates
- Pin dependency versions
- Minimal dependency principle

---

## 7. Incident Response

### Severity Levels
| Level | Definition | Response Time |
|-------|-----------|---------------|
| SEV-1 | Data breach, service outage | 15 min |
| SEV-2 | Suspicious activity, partial outage | 1 hour |
| SEV-3 | Minor issue, non-critical | 24 hours |
| SEV-4 | Informational | Next sprint |

### Response Plan
1. **Detect** — Monitoring alerts (Sentry, UptimeRobot, custom)
2. **Isolate** — Revoke compromised tokens, block IP
3. **Assess** — Determine scope & severity
4. **Contain** — Patch vulnerability, rotate secrets
5. **Recover** — Restore from backup if needed
6. **Notify** — Inform affected users (within 72 hours per UU PDP)
7. **Post-mortem** — Root cause analysis, preventive measures

---

## 8. Compliance Checklist

| Requirement | Status | Notes |
|------------|--------|-------|
| UU PDP (Indonesia data protection) | Planned | Consent mechanism, data deletion API |
| ISO 27001 | Not yet | Post-MVP, target year 2 |
| PCI DSS | N/A | Payment handled by gateway |
| WCAG 2.1 AA | Planned | Nuxt UI 4 has built-in a11y |
| GDPR | Not yet | For EU expansion |

---

## 9. Security Testing Schedule

| Type | Frequency | Tool/Method |
|------|-----------|-------------|
| Dependency scan | Weekly | Snyk / npm audit |
| SAST | Every PR | SonarQube / CodeQL |
| DAST | Monthly | OWASP ZAP |
| Penetration test | Quarterly | External vendor |
| Bug bounty | Year 2+ | HackerOne / local |
