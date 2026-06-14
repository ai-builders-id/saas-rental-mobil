import { eq } from 'drizzle-orm'
import { useDb } from '../db'
import { profiles, tenants } from '../db/schema'

// GET /api/me — profil + tenant + role user saat ini.
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const db = useDb()

  const [[profile], [tenant]] = await Promise.all([
    db.select().from(profiles).where(eq(profiles.id, ctx.userId)).limit(1),
    db.select().from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1),
  ])

  return { profile, tenant, role: ctx.role }
})
