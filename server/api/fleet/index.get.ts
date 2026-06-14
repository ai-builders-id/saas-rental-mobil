import { and, eq, or, ilike, desc, count, sql } from 'drizzle-orm'
import { fleetListQuerySchema } from '#shared/validators/fleet'
import { useDb } from '../../db'
import { vehicles, branches } from '../../db/schema'

// GET /api/fleet — daftar armada (filter cabang/status + pencarian + paginasi).
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const q = await getValidatedQuery(event, (x) => fleetListQuerySchema.safeParse(x))
  if (!q.success) throw fromZod(q.error)
  const { page, perPage, search, branch_id, status } = q.data

  const db = useDb()
  const where = and(
    eq(vehicles.tenant_id, ctx.tenantId),
    branch_id ? eq(vehicles.branch_id, branch_id) : undefined,
    status ? eq(vehicles.status, status) : undefined,
    search
      ? or(
          ilike(vehicles.brand, `%${search}%`),
          ilike(vehicles.model, `%${search}%`),
          ilike(vehicles.plate_no, `%${search}%`),
        )
      : undefined,
  )

  const { from } = rangeFor(page, perPage)
  const [rows, totals] = await Promise.all([
    db.select({
      id: vehicles.id,
      tenant_id: vehicles.tenant_id,
      branch_id: vehicles.branch_id,
      branch_name: sql<string>`coalesce(${branches.name}, '')`,
      brand: vehicles.brand,
      model: vehicles.model,
      year: vehicles.year,
      plate_no: vehicles.plate_no,
      color: vehicles.color,
      photos: vehicles.photos,
      price_daily: vehicles.price_daily,
      price_weekly: vehicles.price_weekly,
      price_monthly: vehicles.price_monthly,
      price_with_driver: vehicles.price_with_driver,
      status: vehicles.status,
      odometer: vehicles.odometer,
      created_at: vehicles.created_at,
      updated_at: vehicles.updated_at,
    }).from(vehicles)
      .leftJoin(branches, eq(vehicles.branch_id, branches.id))
      .where(where)
      .orderBy(desc(vehicles.created_at)).limit(perPage).offset(from),
    db.select({ total: count() }).from(vehicles).where(where),
  ])

  return paginated(rows, page, perPage, totals[0]?.total ?? 0)
})
