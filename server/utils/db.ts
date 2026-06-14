// Re-export client Drizzle agar mudah dipakai di handler (auto-import Nitro
// tidak menjangkau import default, jadi sediakan helper eksplisit).
import { useDb } from '../db'

export { useDb }

// Konversi error postgres.js → HTTP yang sesuai (mirror server/utils/errors.ts).
// postgres.js menaruh SQLSTATE di err.code.
export function rethrowDbError(err: unknown): never {
  const e = err as { code?: string; message?: string; detail?: string }
  switch (e.code) {
    case '23505':
      throw conflict('Data sudah ada (duplikat).', { detail: e.detail })
    case '23P01':
      throw conflict('Jadwal bertumpuk: unit sudah dibooking pada rentang waktu tersebut.', { detail: e.detail })
    case '23503':
      throw badRequest('Referensi tidak valid (data terkait tidak ditemukan).', { detail: e.detail })
    case '23514':
      throw badRequest('Nilai melanggar batasan (constraint).', { detail: e.detail })
    default:
      throw serverError(e.message ?? 'Kesalahan database', { code: e.code, detail: e.detail })
  }
}
