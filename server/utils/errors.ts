import type { ZodError } from 'zod'

// Wrapper createError ringkas dengan pesan Bahasa Indonesia yang konsisten.
export function badRequest(message: string, data?: unknown) {
  return createError({ statusCode: 400, statusMessage: message, data })
}

export function unauthorized(message = 'Tidak terautentikasi') {
  return createError({ statusCode: 401, statusMessage: message })
}

export function forbidden(message = 'Akses ditolak') {
  return createError({ statusCode: 403, statusMessage: message })
}

export function notFound(message = 'Data tidak ditemukan') {
  return createError({ statusCode: 404, statusMessage: message })
}

export function conflict(message: string, data?: unknown) {
  return createError({ statusCode: 409, statusMessage: message, data })
}

export function serverError(message = 'Terjadi kesalahan server', data?: unknown) {
  return createError({ statusCode: 500, statusMessage: message, data })
}

// Format error Zod → 400 dengan detail field.
export function fromZod(err: ZodError) {
  return createError({
    statusCode: 400,
    statusMessage: 'Validasi gagal',
    data: { issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) },
  })
}

// Terjemahkan error PostgREST/Supabase umum ke HTTP yang sesuai.
export function fromSupabase(error: { code?: string; message: string; details?: string }) {
  // 23505 unique_violation, 23P01 exclusion_violation (overbooking),
  // 23503 foreign_key_violation, 23514 check_violation
  switch (error.code) {
    case '23505':
      return conflict('Data sudah ada (duplikat).', { detail: error.details })
    case '23P01':
      return conflict('Jadwal bertumpuk: unit sudah dibooking pada rentang waktu tersebut.', {
        detail: error.details,
      })
    case '23503':
      return badRequest('Referensi tidak valid (data terkait tidak ditemukan).', {
        detail: error.details,
      })
    case '23514':
      return badRequest('Nilai melanggar batasan (constraint).', { detail: error.details })
    default:
      return serverError(error.message, { code: error.code, detail: error.details })
  }
}
