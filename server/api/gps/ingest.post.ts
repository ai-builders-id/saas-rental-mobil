// POST /api/gps/ingest — stub ingress data GPS perangkat.
// Publik (API key perangkat). Saat integrasi nyata: validasi device API key,
// update posisi di Redis (sorted set) + broadcast via WebSocket.
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('[GPS] stub ingest:', JSON.stringify(body).slice(0, 300))
  return { status: 'ok', stub: true }
})
