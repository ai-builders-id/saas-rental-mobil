import { z } from 'zod'
import { BRANCH_STATUSES } from '../constants/enums'

export const branchCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().max(300).optional(),
  phone: z.string().trim().max(30).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  operating_hours: z.record(z.string(), z.unknown()).optional(),
  photo_url: z.url().optional(),
  status: z.enum(BRANCH_STATUSES).default('active'),
})
export type BranchCreateInput = z.infer<typeof branchCreateSchema>

export const branchUpdateSchema = branchCreateSchema.partial()
export type BranchUpdateInput = z.infer<typeof branchUpdateSchema>
