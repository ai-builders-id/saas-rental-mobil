import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'
import { useDb } from '../db'
import { profiles } from '../db/schema'
import type { AuthContext } from '#shared/types/models'

const PUBLIC_PREFIXES = [
  '/api/whatsapp/webhook',
  '/api/payments/midtrans/notify',
  '/api/gps/ingest',
  '/api/health',
]

export default defineEventHandler(async (event) => {
  const path = event.path || ''
  if (!path.startsWith('/api/')) return
  if (PUBLIC_PREFIXES.some((p) => path.startsWith(p))) return

  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user?.id) return

  event.context.authUserId = user.id

  try {
    const db = useDb()
    const [profile] = await db
      .select({ tenant_id: profiles.tenant_id, role: profiles.role, is_active: profiles.is_active })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!profile) return
    if (!profile.is_active) {
      throw createError({ statusCode: 403, statusMessage: 'Akun dinonaktifkan.' })
    }

    event.context.auth = {
      userId: user.id,
      tenantId: profile.tenant_id,
      role: profile.role,
    } satisfies AuthContext
  } catch (err: any) {
    if (err?.code === 'UNDEFINED_VALUE') return
    throw err
  }
})
