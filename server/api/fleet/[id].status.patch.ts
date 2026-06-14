import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { vehicleStatusSchema } from '#shared/validators/vehicle'
import { useDb } from '../../db'
import { vehicles } from '../../db/schema'

// PATCH /api/fleet/:id/status — ubah status armada (admin/owner/operator)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'operator')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID kendaraan tidak valid')

  const body = await readValidatedBody(event, (b) => vehicleStatusSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  try {
    const [row] = await db.update(vehicles)
      .set({ status: body.data.status, updated_at: new Date() })
      .where(and(eq(vehicles.id, id.data), eq(vehicles.tenant_id, ctx.tenantId)))
      .returning()
    if (!row) throw notFound('Kendaraan tidak ditemukan')
    return row
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode) throw err
    rethrowDbError(err)
  }
})
