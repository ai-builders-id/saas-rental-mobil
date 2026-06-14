import { z } from 'zod'
import { FLEET_STATUSES } from '../constants/enums'

// Query khusus list armada (filter cabang/status + paginasi/pencarian)
export const fleetListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(200).optional(),
  branch_id: z.uuid().optional(),
  status: z.enum(FLEET_STATUSES).optional(),
})
export type FleetListQuery = z.infer<typeof fleetListQuerySchema>

export const transferSchema = z.object({
  to_branch_id: z.uuid(),
})
export type TransferInput = z.infer<typeof transferSchema>
