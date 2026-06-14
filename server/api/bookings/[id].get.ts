import { uuidSchema } from '#shared/validators/common'
import { bookings } from '../../db/schema'

// GET /api/bookings/:id
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID booking tidak valid')
  return findOwned(bookings, id.data, ctx.tenantId, 'Booking tidak ditemukan')
})
