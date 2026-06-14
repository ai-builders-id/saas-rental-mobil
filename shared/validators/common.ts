import { z } from 'zod'

// Query paginasi & pencarian umum untuk endpoint list
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(200).optional(),
})
export type PaginationQuery = z.infer<typeof paginationQuerySchema>

export const uuidSchema = z.uuid()
