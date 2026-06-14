import { z } from 'zod'
import { SUBSCRIPTION_TIERS } from '../constants/enums'

// Bootstrap: dipanggil sekali setelah signup untuk membuat tenant + profil owner.
export const bootstrapSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  fullName: z.string().trim().min(2).max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  tier: z.enum(SUBSCRIPTION_TIERS).default('pro'),
})
export type BootstrapInput = z.infer<typeof bootstrapSchema>

export const tenantUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  address: z.string().trim().max(300).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.email().optional(),
  logo_url: z.url().optional(),
  timezone: z.string().trim().max(60).optional(),
  currency: z.string().trim().length(3).optional(),
  wa_number: z.string().trim().max(30).optional(),
})
export type TenantUpdateInput = z.infer<typeof tenantUpdateSchema>
