import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { useDb } from '../../db'
import { branches } from '../../db/schema'

// DELETE /api/branches/:id (owner)
export default defineEventHandler(async (event) => {
  const ctx = requireRole(event, 'owner')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID cabang tidak valid')

  const db = useDb()
  try {
    const [row] = await db.delete(branches)
      .where(and(eq(branches.id, id.data), eq(branches.tenant_id, ctx.tenantId)))
      .returning({ id: branches.id })
    if (!row) throw notFound('Cabang tidak ditemukan')
    return { id: row.id, deleted: true }
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode) throw err
    rethrowDbError(err)
  }
})
