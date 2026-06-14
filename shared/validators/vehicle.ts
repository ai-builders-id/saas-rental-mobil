import { z } from 'zod'
import { FLEET_STATUSES, DOCUMENT_TYPES } from '../constants/enums'

const currentYear = 2026

export const vehicleCreateSchema = z.object({
  branch_id: z.uuid().nullish(),
  brand: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  year: z.coerce.number().int().min(1980).max(currentYear + 1),
  plate_no: z.string().trim().min(2).max(15),
  color: z.string().trim().max(30).optional(),
  photos: z.array(z.url()).default([]),
  price_daily: z.coerce.number().min(0),
  price_weekly: z.coerce.number().min(0).nullish(),
  price_monthly: z.coerce.number().min(0).nullish(),
  price_with_driver: z.coerce.number().min(0).nullish(),
  odometer: z.coerce.number().int().min(0).default(0),
})
export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>

export const vehicleUpdateSchema = vehicleCreateSchema.partial()
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>

// status di-set lewat endpoint khusus (PATCH /api/fleet/:id/status)
export const vehicleStatusSchema = z.object({
  status: z.enum(FLEET_STATUSES),
})

export const maintenanceCreateSchema = z.object({
  scheduled_at: z.iso.date(),
  type: z.string().trim().min(1).max(120),
  cost: z.coerce.number().min(0).nullish(),
  workshop: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
})
export type MaintenanceCreateInput = z.infer<typeof maintenanceCreateSchema>

export const vehicleDocumentSchema = z.object({
  type: z.enum(DOCUMENT_TYPES),
  file_url: z.url(),
  expires_at: z.iso.date().nullish(),
})
export type VehicleDocumentInput = z.infer<typeof vehicleDocumentSchema>
