import { uuidSchema } from '#shared/validators/common'
import { customers } from '../../db/schema'

// GET /api/customers/:id
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID pelanggan tidak valid')
  return findOwned(customers, id.data, ctx.tenantId, 'Pelanggan tidak ditemukan')
})
