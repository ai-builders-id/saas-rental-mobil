import { and, eq, count } from 'drizzle-orm'
import { useDb } from '../../db'
import { vehicles, bookings, payments } from '../../db/schema'

// GET /api/reports/summary — ringkasan dashboard (stub, tapi pakai data riil).
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const db = useDb()
  const tenantWhere = eq(vehicles.tenant_id, ctx.tenantId)

  const [availC, rentedC, maintC] = await Promise.all([
    db.select({ n: count() }).from(vehicles)
      .where(and(tenantWhere, eq(vehicles.status, 'available'))),
    db.select({ n: count() }).from(vehicles)
      .where(and(tenantWhere, eq(vehicles.status, 'on_rent'))),
    db.select({ n: count() }).from(vehicles)
      .where(and(tenantWhere, eq(vehicles.status, 'maintenance'))),
  ])

  // Ringkasan booking aktif
  const activeB = await db.select({ n: count() }).from(bookings)
    .where(and(eq(bookings.tenant_id, ctx.tenantId), eq(bookings.status, 'active')))

  return {
    fleet: {
      total: (availC[0]?.n ?? 0) + (rentedC[0]?.n ?? 0) + (maintC[0]?.n ?? 0),
      available: availC[0]?.n ?? 0,
      on_rent: rentedC[0]?.n ?? 0,
      maintenance: maintC[0]?.n ?? 0,
    },
    active_bookings: activeB[0]?.n ?? 0,
    period: 'live',
  }
})
