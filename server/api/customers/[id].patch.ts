import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { customerUpdateSchema } from '#shared/validators/customer'
import { useDb } from '../../db'
import { customers } from '../../db/schema'

// PATCH /api/customers/:id (admin/owner)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'admin')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID pelanggan tidak valid')

  const body = await readValidatedBody(event, (b) => customerUpdateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  try {
    const [row] = await db.update(customers)
      .set({ ...body.data, updated_at: new Date() })
      .where(and(eq(customers.id, id.data), eq(customers.tenant_id, ctx.tenantId)))
      .returning()
    if (!row) throw notFound('Pelanggan tidak ditemukan')
    return row
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode) throw err
    rethrowDbError(err)
  }
})
