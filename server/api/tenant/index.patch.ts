import { eq } from 'drizzle-orm'
import { tenantUpdateSchema } from '#shared/validators/tenant'
import { useDb } from '../../db'
import { tenants } from '../../db/schema'

// PATCH /api/tenant — update profil bisnis (owner/admin).
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'admin')
  const body = await readValidatedBody(event, (b) => tenantUpdateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  try {
    const [updated] = await db.update(tenants)
      .set({ ...body.data, updated_at: new Date() })
      .where(eq(tenants.id, ctx.tenantId))
      .returning()
    if (!updated) throw notFound('Tenant tidak ditemukan')
    return updated
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode) throw err
    rethrowDbError(err)
  }
})
