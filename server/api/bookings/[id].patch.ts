import { and, eq } from 'drizzle-orm'
import { uuidSchema } from '#shared/validators/common'
import { bookingUpdateSchema } from '#shared/validators/booking'
import { useDb } from '../../db'
import { bookings } from '../../db/schema'

// PATCH /api/bookings/:id — update detail booking (admin/owner/operator)
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'operator')
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID booking tidak valid')

  const body = await readValidatedBody(event, (b) => bookingUpdateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const values: Record<string, unknown> = { updated_at: new Date() }
  for (const [k, v] of Object.entries(body.data)) {
    if (v === undefined) continue
    if (k === 'start_at' || k === 'end_at') {
      values[k] = new Date(v as string)
    } else if (k === 'price_total' || k === 'dp_amount') {
      values[k] = String(v)
    } else {
      values[k] = v
    }
  }

  const db = useDb()
  try {
    const [row] = await db.update(bookings)
      .set(values)
      .where(and(eq(bookings.id, id.data), eq(bookings.tenant_id, ctx.tenantId)))
      .returning()
    if (!row) throw notFound('Booking tidak ditemukan')
    return row
  } catch (err) {
    if ((err as { statusCode?: number }).statusCode) throw err
    rethrowDbError(err)
  }
})
