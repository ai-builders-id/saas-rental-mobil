import { and, eq, or, ilike, desc, count } from 'drizzle-orm'
import { paginationQuerySchema } from '#shared/validators/common'
import { useDb } from '../../db'
import { customers } from '../../db/schema'

// GET /api/customers (paginasi + cari nama/telepon)
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const q = await getValidatedQuery(event, (x) => paginationQuerySchema.safeParse(x))
  if (!q.success) throw fromZod(q.error)
  const { page, perPage, search } = q.data

  const db = useDb()
  const where = and(
    eq(customers.tenant_id, ctx.tenantId),
    search ? or(
      ilike(customers.name, `%${search}%`),
      ilike(customers.phone, `%${search}%`),
    ) : undefined,
  )

  const { from } = rangeFor(page, perPage)
  const [rows, totals] = await Promise.all([
    db.select().from(customers).where(where)
      .orderBy(desc(customers.created_at)).limit(perPage).offset(from),
    db.select({ total: count() }).from(customers).where(where),
  ])

  return paginated(rows, page, perPage, totals[0]?.total ?? 0)
})
