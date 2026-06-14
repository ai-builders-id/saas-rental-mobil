import { and, eq } from 'drizzle-orm'
import { bookingCreateSchema } from '#shared/validators/booking'
import { computeBookingPrice, defaultDp } from '../../utils/booking'
import { useDb } from '../../db'
import { bookings, vehicles, customers, branches } from '../../db/schema'

// POST /api/bookings — buat booking (admin/owner/operator)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'operator')
  const body = await readValidatedBody(event, (b) => bookingCreateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)
  const { vehicle_id, customer_id, branch_id, start_at, end_at, with_driver, notes } = body.data

  const db = useDb()

  // Validasi semua referensi milik tenant ini
  const [vehicle, customer] = await Promise.all([
    db.select().from(vehicles)
      .where(and(eq(vehicles.id, vehicle_id), eq(vehicles.tenant_id, ctx.tenantId)))
      .limit(1).then((r) => r[0]),
    db.select().from(customers)
      .where(and(eq(customers.id, customer_id), eq(customers.tenant_id, ctx.tenantId)))
      .limit(1).then((r) => r[0]),
  ])
  if (!vehicle) throw badRequest('Kendaraan tidak ditemukan untuk tenant ini')
  if (!customer) throw badRequest('Pelanggan tidak ditemukan untuk tenant ini')

  if (customer.status === 'blacklisted') throw forbidden('Pelanggan ini masuk blacklist')

  if (vehicle.status !== 'available' && vehicle.status !== 'booked') {
    throw conflict(`Kendaraan sedang berstatus ${vehicle.status}`, { vehicleId: vehicle_id })
  }

  if (branch_id) {
    const [branch] = await db.select({ id: branches.id }).from(branches)
      .where(and(eq(branches.id, branch_id), eq(branches.tenant_id, ctx.tenantId))).limit(1)
    if (!branch) throw badRequest('Cabang tidak valid untuk tenant ini')
  }

  // Hitung harga
  const priceTotal = body.data.price_total ?? computeBookingPrice(vehicle, start_at, end_at, with_driver)
  const dpAmount = body.data.dp_amount ?? defaultDp(Number(priceTotal))

  try {
    const [row] = await db.insert(bookings).values({
      vehicle_id,
      customer_id,
      branch_id: branch_id ?? null,
      start_at: new Date(start_at),
      end_at: new Date(end_at),
      with_driver: with_driver ?? false,
      price_total: String(priceTotal),
      dp_amount: String(dpAmount),
      notes: notes ?? null,
      tenant_id: ctx.tenantId,
    }).returning()

    setResponseStatus(event, 201)
    return row
  } catch (err) {
    rethrowDbError(err) // handler untuk 23P01 (overbooking) via rethrowDbError
  }
})
