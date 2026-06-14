import { eq } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'
import { bootstrapSchema } from '#shared/validators/tenant'
import { TRIAL_DAYS } from '#shared/constants/labels'
import { useDb } from '../../db'
import { tenants, profiles } from '../../db/schema'

// POST /api/auth/bootstrap
// Dipanggil sekali setelah signup: membuat tenant + profil owner untuk user login.
export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event).catch(() => null)
  if (!user) throw unauthorized('Harus login terlebih dahulu untuk bootstrap.')

  const body = await readValidatedBody(event, (b) => bootstrapSchema.safeParse(b))
  if (!body.success) throw fromZod(body.error)
  const input = body.data

  const db = useDb()

  // Idempoten: jika profil sudah ada, kembalikan tenant yang ada.
  const [existing] = await db
    .select({ tenant_id: profiles.tenant_id })
    .from(profiles).where(eq(profiles.id, user.id)).limit(1)

  if (existing) {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, existing.tenant_id)).limit(1)
    return { tenant, alreadyBootstrapped: true }
  }

  const trialEnds = new Date()
  trialEnds.setDate(trialEnds.getDate() + TRIAL_DAYS)

  try {
    const result = await db.transaction(async (tx) => {
      const [tenant] = await tx.insert(tenants).values({
        name: input.businessName,
        email: user.email ?? null,
        subscription_tier: input.tier,
        subscription_status: 'trialing',
        trial_ends_at: trialEnds,
      }).returning()
      if (!tenant) throw serverError('Gagal membuat tenant')

      await tx.insert(profiles).values({
        id: user.id,
        tenant_id: tenant.id,
        role: 'owner',
        full_name: input.fullName ?? null,
        phone: input.phone ?? null,
      })

      return tenant
    })

    setResponseStatus(event, 201)
    return { tenant: result, alreadyBootstrapped: false }
  } catch (err) {
    rethrowDbError(err)
  }
})
