import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { vehicleUpdateSchema } from '#shared/validators/vehicle'
import { useDb } from '../../db'
import { vehicles } from '../../db/schema'

// PATCH /api/fleet/:id — update detail kendaraan (admin/owner)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'admin')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID kendaraan tidak valid')

  const body = await readValidatedBody(event, (b) => vehicleUpdateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  const values: Record<string, unknown> = { updated_at: new Date() }
  for (const [k, v] of Object.entries(body.data)) {
    if (v === undefined) continue
    // numeric fields stored as string in Drizzle
    if (['price_daily', 'price_weekly', 'price_monthly', 'price_with_driver'].includes(k)) {
      values[k] = v != null ? String(v) : null
    } else {
      values[k] = v
    }
  }

  try {
    const [row] = await db.update(vehicles)
      .set(values)
      .where(and(eq(vehicles.id, id.data), eq(vehicles.tenant_id, ctx.tenantId)))
      .returning()
    if (!row) throw notFound('Kendaraan tidak ditemukan')
    return row
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode) throw err
    rethrowDbError(err)
  }
})
