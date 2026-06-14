import { customerCreateSchema } from '#shared/validators/customer'
import { useDb } from '../../db'
import { customers } from '../../db/schema'

// POST /api/customers (admin/owner)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'admin')
  const body = await readValidatedBody(event, (b) => customerCreateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  try {
    const [row] = await db.insert(customers)
      .values({ ...body.data, tenant_id: ctx.tenantId })
      .returning()
    setResponseStatus(event, 201)
    return row
  } catch (err) {
    rethrowDbError(err)
  }
})
