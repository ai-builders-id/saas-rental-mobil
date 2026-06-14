import { uuidSchema } from '#shared/validators/common'
import { vehicles } from '../../db/schema'

// GET /api/fleet/:id
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID kendaraan tidak valid')
  return findOwned(vehicles, id.data, ctx.tenantId, 'Kendaraan tidak ditemukan')
})
