import { uuidSchema } from '#shared/validators/common'
import { branches } from '../../db/schema'

// GET /api/branches/:id
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID cabang tidak valid')
  return findOwned(branches, id.data, ctx.tenantId, 'Cabang tidak ditemukan')
})
