// Health check publik (tidak butuh auth).
export default defineEventHandler(() => {
  return { ok: true, service: 'rental-mobil-api', time: new Date().toISOString() }
})
