import { uuidSchema } from '#shared/validators/common'

// GET /api/gps/vehicles/:id/location — stub posisi terakhir (milik tenant).
// Saat integrasi nyata: ambil dari Redis sorted set → lat/lng/speed/updated_at.
export default defineEventHandler(async (event) => {
  requireAuth(event)
  const id = uuidSchema.safeParse(getRouterParam(event, 'id'))
  if (!id.success) throw badRequest('ID kendaraan tidak valid')

  return {
    vehicle_id: id.data,
    lat: -6.2146 + Math.random() * 0.01,
    lng: 106.8451 + Math.random() * 0.01,
    speed_kmh: Math.round(30 + Math.random() * 40),
    updated_at: new Date().toISOString(),
    stub: true,
  }
})
