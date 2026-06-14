import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { blacklistSchema } from '#shared/validators/customer'
import { useDb } from '../../../db'
import { customers } from '../../../db/schema'

// POST /api/customers/:id/blacklist (owner)
export default defineEventHandler(async (event) => {
  const ctx = requireRole(event, 'owner')
  const custId = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!custId.success) throw badRequest('ID pelanggan tidak valid')

  const body = await readValidatedBody(event, (b) => blacklistSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  try {
    const [row] = await db.update(customers)
      .set({ status: 'blacklisted', blacklist_reason: body.data.reason, updated_at: new Date() })
      .where(and(eq(customers.id, custId.data), eq(customers.tenant_id, ctx.tenantId)))
      .returning()
    if (!row) throw notFound('Pelanggan tidak ditemukan')
    return row
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode) throw err
    rethrowDbError(err)
  }
})
