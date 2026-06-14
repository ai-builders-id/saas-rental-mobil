import { and, eq, ilike, desc, count } from 'drizzle-orm'
import { paginationQuerySchema } from '#shared/validators/common'
import { useDb } from '../../db'
import { branches } from '../../db/schema'

// GET /api/branches — daftar cabang (paginasi + pencarian nama).
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const q = await getValidatedQuery(event, (x) => paginationQuerySchema.safeParse(x))
  if (!q.success) throw fromZod(q.error)
  const { page, perPage, search } = q.data

  const db = useDb()
  const where = and(
    eq(branches.tenant_id, ctx.tenantId),
    search ? ilike(branches.name, `%${search}%`) : undefined,
  )

  const { from } = rangeFor(page, perPage)
  const [rows, totals] = await Promise.all([
    db.select().from(branches).where(where)
      .orderBy(desc(branches.created_at)).limit(perPage).offset(from),
    db.select({ total: count() }).from(branches).where(where),
  ])

  return paginated(rows, page, perPage, totals[0]?.total ?? 0)
})
