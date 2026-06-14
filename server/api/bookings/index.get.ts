import { and, eq, gte, lte, desc, count, sql } from 'drizzle-orm'
import { bookingListQuerySchema } from '#shared/validators/booking'
import { useDb } from '../../db'
import { bookings, vehicles, customers } from '../../db/schema'

// GET /api/bookings — daftar booking (filter status/cabang/kendaraan/pelanggan/rentang)
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const q = await getValidatedQuery(event, (x) => bookingListQuerySchema.safeParse(x))
  if (!q.success) throw fromZod(q.error)
  const { page, perPage, status, vehicle_id, customer_id, branch_id, from, to } = q.data

  const db = useDb()
  const where = and(
    eq(bookings.tenant_id, ctx.tenantId),
    status ? eq(bookings.status, status) : undefined,
    vehicle_id ? eq(bookings.vehicle_id, vehicle_id) : undefined,
    customer_id ? eq(bookings.customer_id, customer_id) : undefined,
    branch_id ? eq(bookings.branch_id, branch_id) : undefined,
    from ? gte(bookings.start_at, new Date(from)) : undefined,
    to ? lte(bookings.end_at, new Date(to)) : undefined,
  )

  const { from: off } = rangeFor(page, perPage)
  const [rows, totals] = await Promise.all([
    db.select({
      id: bookings.id,
      tenant_id: bookings.tenant_id,
      vehicle_id: bookings.vehicle_id,
      customer_id: bookings.customer_id,
      branch_id: bookings.branch_id,
      start_at: bookings.start_at,
      end_at: bookings.end_at,
      with_driver: bookings.with_driver,
      price_total: bookings.price_total,
      dp_amount: bookings.dp_amount,
      status: bookings.status,
      notes: bookings.notes,
      created_at: bookings.created_at,
      updated_at: bookings.updated_at,
      plate: sql<string>`${vehicles.plate_no}`,
      vehicle_name: sql<string>`concat(${vehicles.brand}, ' ', ${vehicles.model})`,
      customer_name: sql<string>`${customers.name}`,
      customer_phone: sql<string>`${customers.phone}`,
    }).from(bookings)
      .innerJoin(vehicles, eq(bookings.vehicle_id, vehicles.id))
      .innerJoin(customers, eq(bookings.customer_id, customers.id))
      .where(where)
      .orderBy(desc(bookings.created_at)).limit(perPage).offset(off),
    db.select({ total: count() }).from(bookings).where(where),
  ])

  return paginated(rows, page, perPage, totals[0]?.total ?? 0)
})
