import { and, eq } from 'drizzle-orm'
import { vehicleCreateSchema } from '#shared/validators/vehicle'
import { useDb } from '../../db'
import { vehicles, branches } from '../../db/schema'

// POST /api/fleet — tambah kendaraan (admin/owner).
export default defineEventHandler(async (event) => {
  const ctx = requireMinRole(event, 'admin')
  const body = await readValidatedBody(event, (b) => vehicleCreateSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)

  const db = useDb()

  // Validasi branch_id (jika ada) milik tenant ini.
  if (body.data.branch_id) {
    const [branch] = await db.select({ id: branches.id }).from(branches)
      .where(and(eq(branches.id, body.data.branch_id), eq(branches.tenant_id, ctx.tenantId))).limit(1)
    if (!branch) throw badRequest('Cabang tidak valid untuk tenant ini')
  }

  try {
    const [row] = await db.insert(vehicles)
      .values({
        ...body.data,
        // numeric disimpan sebagai string oleh Drizzle pg; konversi aman.
        price_daily: String(body.data.price_daily),
        price_weekly: body.data.price_weekly != null ? String(body.data.price_weekly) : null,
        price_monthly: body.data.price_monthly != null ? String(body.data.price_monthly) : null,
        price_with_driver: body.data.price_with_driver != null ? String(body.data.price_with_driver) : null,
        tenant_id: ctx.tenantId,
      })
      .returning()
    setResponseStatus(event, 201)
    return row
  } catch (err) {
    rethrowDbError(err)
  }
})
