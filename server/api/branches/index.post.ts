import { branchCreateSchema } from '#shared/validators/branch'
import { useDb } from '../../db'
import { branches } from '../../db/schema'

// POST /api/branches — tambah cabang (admin/owner).
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'admin')
  const body = await readValidatedBody(event, (b) => branchCreateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  try {
    const [row] = await db.insert(branches)
      .values({ ...body.data, tenant_id: ctx.tenantId })
      .returning()
    setResponseStatus(event, 201)
    return row
  } catch (err) {
    rethrowDbError(err)
  }
})
