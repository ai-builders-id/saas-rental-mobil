import { defineConfig } from 'drizzle-kit'

// Konfigurasi drizzle-kit. Migrasi tabel/enum/index digenerate dari
// server/db/schema.ts ke supabase/migrations (prefix numerik, urut).
export default defineConfig({
  schema: './server/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  migrations: {
    prefix: 'index',
  },
  dbCredentials: {
    // Transaction pooler (port 6543) — kompatibel dengan Drizzle ORM
    url: process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? '',
  },
  // Jangan sentuh schema milik Supabase (auth, storage, dst.)
  schemaFilter: ['public'],
  verbose: true,
  strict: true,
})
