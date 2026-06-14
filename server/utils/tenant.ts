import type { H3Event } from 'h3'
import type { AuthContext } from '#shared/types/models'
import type { UserRole } from '#shared/constants/enums'

// Ambil konteks auth yang sudah diisi server/middleware/auth.ts.
// Melempar 401 bila route diakses tanpa user (mis. middleware tak menemukan sesi).
export function requireAuth(event: H3Event): AuthContext {
  const ctx = event.context.auth as AuthContext | undefined
  if (!ctx) throw unauthorized()
  return ctx
}

// Guard berbasis role. Owner selalu lolos. Lempar 403 bila tak cukup hak.
const ROLE_RANK: Record<UserRole, number> = {
  viewer: 0,
  operator: 1,
  admin: 2,
  owner: 3,
}

export function requireRole(event: H3Event, ...allowed: UserRole[]): AuthContext {
  const ctx = requireAuth(event)
  if (allowed.includes(ctx.role)) return ctx
  throw forbidden(`Butuh peran: ${allowed.join(' / ')}. Peran Anda: ${ctx.role}.`)
}

// Guard minimal level (mis. requireMinRole(event, 'admin') → admin & owner).
export function requireMinRole(event: H3Event, min: UserRole): AuthContext {
  const ctx = requireAuth(event)
  if (ROLE_RANK[ctx.role] >= ROLE_RANK[min]) return ctx
  throw forbidden(`Butuh peran minimal: ${min}. Peran Anda: ${ctx.role}.`)
}
