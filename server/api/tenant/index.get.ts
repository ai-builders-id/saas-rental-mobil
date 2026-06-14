import { eq } from 'drizzle-orm'
import { useDb } from '../../db'
import { tenants } from '../../db/schema'

// GET /api/tenant — detail tenant aktif.
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const db = useDb()
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, ctx.tenantId)).limit(1)
  if (!tenant) throw notFound('Tenant tidak ditemukan')
  return tenant
})
