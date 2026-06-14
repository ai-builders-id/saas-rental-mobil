import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { bookingStatusSchema } from '#shared/validators/booking'
import { BOOKING_TRANSITIONS } from '#shared/constants/enums'
import { useDb } from '../../../db'
import { bookings } from '../../../db/schema'

// PATCH /api/bookings/:id/status — workflow status (verify transisi valid)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'operator')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID booking tidak valid')

  const body = await readValidatedBody(event, (b) => bookingStatusSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)
  const { status: newStatus } = body.data

  const db = useDb()
  const [row] = await db.select().from(bookings)
    .where(and(eq(bookings.id, id.data), eq(bookings.tenant_id, ctx.tenantId)))
    .limit(1)
  if (!row) throw notFound('Booking tidak ditemukan')

  const allowed = BOOKING_TRANSITIONS[row.status]
  if (!allowed || !allowed.includes(newStatus)) {
    throw badRequest(
      `Transisi status tidak valid: ${row.status} → ${newStatus}. ` +
      `Transisi yang diizinkan: ${(allowed ?? []).join(' → ') || '(tidak ada)'}`,
    )
  }

  try {
    const [updated] = await db.update(bookings)
      .set({ status: newStatus, updated_at: new Date() })
      .where(eq(bookings.id, id.data))
      .returning()
    return updated
  } catch (err) {
    rethrowDbError(err)
  }
})
