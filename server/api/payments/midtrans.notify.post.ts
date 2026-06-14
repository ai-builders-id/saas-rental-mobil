// POST /api/payments/midtrans/notify — stub webhook Midtrans.
// Publik (IP Midtrans di-whitelist). Saat integrasi nyata: validasi signature
// hash, cocokkan transaksi, update status payment + booking.
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('[Payment Midtrans] stub notify:', JSON.stringify(body).slice(0, 400))
  return { status: 'ok', stub: true }
})
