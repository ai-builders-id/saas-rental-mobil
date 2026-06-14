import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { useDb } from '../../db'
import { vehicles } from '../../db/schema'

// DELETE /api/fleet/:id (owner)
export default defineEventHandler(async (event) => {
  const ctx = requireRole(event, 'owner')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID kendaraan tidak valid')

  const db = useDb()
  try {
    const [row] = await db.delete(vehicles)
      .where(and(eq(vehicles.id, id.data), eq(vehicles.tenant_id, ctx.tenantId)))
      .returning({ id: vehicles.id })
    if (!row) throw notFound('Kendaraan tidak ditemukan')
    return { id: row.id, deleted: true }
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode) throw err
    rethrowDbError(err)
  }
})
