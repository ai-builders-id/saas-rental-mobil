import { and, eq, desc, sql } from 'drizzle-orm'
import { useDb } from '../../../db'
import { vehicles, bookings, branches } from '../../../db/schema'

// GET /api/gps/vehicles — daftar kendaraan dengan posisi GPS (milik tenant).
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)

  const db = useDb()
  const rows = await db
    .select({
      id: vehicles.id,
      plate_no: vehicles.plate_no,
      brand: vehicles.brand,
      model: vehicles.model,
      status: vehicles.status,
      branch_name: sql<string>`coalesce(${branches.name}, '')`,
      driver_name: sql<string | null>`null`,
      updated_at: vehicles.updated_at,
    })
    .from(vehicles)
    .leftJoin(branches, eq(vehicles.branch_id, branches.id))
    .where(and(eq(vehicles.tenant_id, ctx.tenantId), eq(vehicles.status, 'on_rent')))
    .orderBy(desc(vehicles.updated_at))
    .limit(50)

  return rows.map((r) => ({
    id: r.id,
    plate: r.plate_no,
    vehicle: `${r.brand} ${r.model}`,
    status: r.status.toUpperCase(),
    driver: r.driver_name,
    speed: Math.round(30 + Math.random() * 50),
    area: r.branch_name || 'Area terpantau',
    updated: 'baru saja',
    x: 30 + Math.random() * 60,
    y: 20 + Math.random() * 60,
    kmToday: Math.round(20 + Math.random() * 120),
    stub: true,
  }))
})
