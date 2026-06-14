import { z } from 'zod'
import { BOOKING_STATUSES, PAYMENT_TYPES, PAYMENT_STATUSES } from '../constants/enums'

export const bookingCreateSchema = z.object({
  vehicle_id: z.uuid(),
  customer_id: z.uuid(),
  branch_id: z.uuid().nullish(),
  start_at: z.iso.datetime({ offset: true }),
  end_at: z.iso.datetime({ offset: true }),
  with_driver: z.boolean().default(false),
  // price_total & dp_amount opsional: bila kosong dihitung server dari tarif unit.
  price_total: z.coerce.number().min(0).optional(),
  dp_amount: z.coerce.number().min(0).optional(),
  notes: z.string().trim().max(1000).optional(),
}).refine((v) => new Date(v.end_at) > new Date(v.start_at), {
  message: 'end_at harus setelah start_at',
  path: ['end_at'],
})
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>

export const bookingUpdateSchema = z.object({
  branch_id: z.uuid().nullish(),
  start_at: z.iso.datetime({ offset: true }).optional(),
  end_at: z.iso.datetime({ offset: true }).optional(),
  with_driver: z.boolean().optional(),
  price_total: z.coerce.number().min(0).optional(),
  dp_amount: z.coerce.number().min(0).optional(),
  notes: z.string().trim().max(1000).optional(),
})
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>

export const bookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
})

export const bookingListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(BOOKING_STATUSES).optional(),
  vehicle_id: z.uuid().optional(),
  customer_id: z.uuid().optional(),
  branch_id: z.uuid().optional(),
  // rentang untuk tampilan kalender
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
})
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>

export const paymentCreateSchema = z.object({
  type: z.enum(PAYMENT_TYPES),
  amount: z.coerce.number().min(0),
  status: z.enum(PAYMENT_STATUSES).default('settled'),
  provider: z.string().trim().max(40).default('manual'),
  external_ref: z.string().trim().max(120).optional(),
})
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>
