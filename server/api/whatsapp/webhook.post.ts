// POST /api/whatsapp/webhook — stub WA Business API webhook.
// Publik (IP di-whitelist oleh WA provider). Saat integrasi nyata, ganti logika
// dengan validasi signature + parser message + queue chatbot.
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('[WA Webhook] stub received:', JSON.stringify(body).slice(0, 500))
  return { status: 'ok', stub: true, message: 'Webhook diterima (stub)' }
})
