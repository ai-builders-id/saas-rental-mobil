import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { branchUpdateSchema } from '#shared/validators/branch'
import { useDb } from '../../db'
import { branches } from '../../db/schema'

// PATCH /api/branches/:id (admin/owner)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'admin')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID cabang tidak valid')

  const body = await readValidatedBody(event, (b) => branchUpdateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  try {
    const [row] = await db.update(branches)
      .set({ ...body.data, updated_at: new Date() })
      .where(and(eq(branches.id, id.data), eq(branches.tenant_id, ctx.tenantId)))
      .returning()
    if (!row) throw notFound('Cabang tidak ditemukan')
    return row
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode) throw err
    rethrowDbError(err)
  }
})
