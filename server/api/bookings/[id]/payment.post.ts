import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { paymentCreateSchema } from '#shared/validators/booking'
import { useDb } from '../../../db'
import { bookings, payments } from '../../../db/schema'

// POST /api/bookings/:id/payment — catat pembayaran (stub gateway, admin/owner)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'admin')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID booking tidak valid')

  // Pastikan booking milik tenant
  await findOwned(bookings, id.data, ctx.tenantId, 'Booking tidak ditemukan')

  const body = await readValidatedBody(event, (b) => paymentCreateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()
  try {
    const [row] = await db.insert(payments).values({
      ...body.data,
      amount: String(body.data.amount),
      tenant_id: ctx.tenantId,
      booking_id: id.data,
      paid_at: body.data.status === 'settled' ? new Date() : null,
    }).returning()

    setResponseStatus(event, 201)
    return row
  } catch (err) {
    rethrowDbError(err)
  }
})
