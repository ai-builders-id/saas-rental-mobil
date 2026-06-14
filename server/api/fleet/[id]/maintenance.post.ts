import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { maintenanceCreateSchema } from '#shared/validators/vehicle'
import { useDb } from '../../../db'
import { maintenanceRecords, vehicles } from '../../../db/schema'

// POST /api/fleet/:id/maintenance — jadwalkan servis (admin/owner)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'admin')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID kendaraan tidak valid')

  // Pastikan kendaraan milik tenant
  await findOwned(vehicles, id.data, ctx.tenantId, 'Kendaraan tidak ditemukan')

  const body = await readValidatedBody(event, (b) => maintenanceCreateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  try {
    const [row] = await db.insert(maintenanceRecords)
      .values({
        ...body.data,
        cost: body.data.cost != null ? String(body.data.cost) : null,
        tenant_id: ctx.tenantId,
        vehicle_id: id.data,
      })
      .returning()
    setResponseStatus(event, 201)
    return row
  } catch (err) {
    rethrowDbError(err)
  }
})
