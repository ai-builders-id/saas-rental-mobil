import { z } from 'zod'

export const customerCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  email: z.email().optional(),
  address: z.string().trim().max(300).optional(),
  ktp_url: z.url().nullish(),
  sim_url: z.url().nullish(),
})
export type CustomerCreateInput = z.infer<typeof customerCreateSchema>

export const customerUpdateSchema = customerCreateSchema.partial()
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>

export const blacklistSchema = z.object({
  reason: z.string().trim().min(3).max(500),
})
export type BlacklistInput = z.infer<typeof blacklistSchema>
