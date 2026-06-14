import { and, eq, desc } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { useDb } from '../../../db'
import { customers, bookings } from '../../../db/schema'

// GET /api/customers/:id/rentals — riwayat sewa pelanggan
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const custId = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!custId.success) throw badRequest('ID pelanggan tidak valid')

  // Pastikan pelanggan milik tenant
  await findOwned(customers, custId.data, ctx.tenantId, 'Pelanggan tidak ditemukan')

  const db = useDb()
  const rows = await db.select().from(bookings)
    .where(and(eq(bookings.customer_id, custId.data), eq(bookings.tenant_id, ctx.tenantId)))
    .orderBy(desc(bookings.created_at))
    .limit(100)

  return rows
})
