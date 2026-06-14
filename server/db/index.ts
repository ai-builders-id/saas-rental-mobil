// Drizzle client singleton (driver: postgres.js).
// Koneksi langsung ke Postgres Supabase via SUPABASE_DB_URL.
//
// CATATAN ISOLASI TENANT:
// Koneksi langsung berjalan sebagai pemilik DB → RLS DI-BYPASS.
// Maka isolasi tenant WAJIB ditegakkan di kode: setiap query memfilter
// tenant_id (lihat server/utils/repo.ts). RLS tetap dipasang sebagai
// pertahanan berlapis untuk jalur akses lain (mis. Supabase client).
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null
let _client: ReturnType<typeof postgres> | null = null

function connectionString(): string {
  const url = process.env.SUPABASE_DB_URL
  if (!url) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'SUPABASE_DB_URL belum di-set. Isi connection string Postgres Supabase di .env.',
    })
  }
  return url
}

export function useDb() {
  if (_db) return _db
  _client = postgres(connectionString(), {
    prepare: false, // kompatibel dengan transaction pooler Supabase
    max: 5,
    types: {
      // Parse Postgres numeric/decimal (OID 1700) → JS number, bukan string,
      // agar selaras dengan tipe `number` di shared/types/models.ts.
      // Aman untuk nominal rupiah (≤ 2^53). Hindari untuk angka sangat besar.
      numeric: {
        to: 1700,
        from: [1700],
        serialize: (x: number | string) => String(x),
        parse: (x: string) => Number(x),
      },
    },
  })
  _db = drizzle(_client, { schema })
  return _db
}

export { schema }
