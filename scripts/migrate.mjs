#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════════════
// scripts/migrate.mjs — Jalankan migrasi SQL ke Supabase Postgres
//
//   node scripts/migrate.mjs          # jalankan semua file supabase/migrations/*.sql
//   node scripts/migrate.mjs --seed   # jalankan juga supabase/seed.sql setelahnya
//
// Butuh env SUPABASE_DB_URL (connection string Postgres, pooler session mode).
// File dijalankan urut nama (0001, 0002, ...). Setiap file di-wrap transaksi.
// ════════════════════════════════════════════════════════════════════════
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Muat .env sederhana (tanpa dependency tambahan)
function loadEnv(file) {
  try {
    const txt = readFileSync(join(root, file), 'utf8')
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      }
    }
  } catch { /* file opsional */ }
}
loadEnv('.env')
loadEnv('.env.local')

const dbUrl = process.env.SUPABASE_DB_URL
if (!dbUrl) {
  console.error('\n✖ SUPABASE_DB_URL belum di-set.')
  console.error('  Isi di .env dengan connection string Postgres (pooler session mode):')
  console.error('  postgresql://postgres.<ref>:<DB_PASSWORD>@aws-0-<region>.pooler.supabase.com:5432/postgres\n')
  process.exit(1)
}

const withSeed = process.argv.includes('--seed')

const migrationsDir = join(root, 'supabase', 'migrations')
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
})

async function run() {
  await client.connect()

  // Tabel pelacak migrasi (idempoten): lewati file yang sudah diterapkan.
  await client.query(`
    create table if not exists public._migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `)
  const { rows: applied } = await client.query('select name from public._migrations')
  const done = new Set(applied.map((r) => r.name))

  const pending = files.filter((f) => !done.has(f))
  console.log(`→ Terhubung. ${pending.length} migrasi pending (${files.length} total).\n`)

  for (const f of files) {
    if (done.has(f)) {
      console.log(`  • ${f} ... SKIP (sudah diterapkan)`)
      continue
    }
    const sql = readFileSync(join(migrationsDir, f), 'utf8')
    process.stdout.write(`  • ${f} ... `)
    try {
      await client.query('begin')
      await client.query(sql)
      await client.query('insert into public._migrations (name) values ($1)', [f])
      await client.query('commit')
      console.log('OK')
    } catch (err) {
      await client.query('rollback')
      console.log('GAGAL')
      console.error(`\n✖ Error di ${f}:\n${err.message}\n`)
      await client.end()
      process.exit(1)
    }
  }

  if (withSeed) {
    const seed = readFileSync(join(root, 'supabase', 'seed.sql'), 'utf8')
    process.stdout.write('  • seed.sql ... ')
    try {
      await client.query(seed)
      console.log('OK')
    } catch (err) {
      console.log('GAGAL')
      console.error(`\n✖ Error di seed.sql:\n${err.message}\n`)
    }
  }

  await client.end()
  console.log('\n✓ Migrasi selesai.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
