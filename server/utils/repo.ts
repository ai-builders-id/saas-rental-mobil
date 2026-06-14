import { and, eq } from 'drizzle-orm'
import type { PgTable, PgColumn } from 'drizzle-orm/pg-core'
import { useDb } from '../db'

// Helper umum: ambil satu baris by id yang DIPASTIKAN milik tenant.
// Mengembalikan baris atau melempar 404. Semua tabel bisnis punya kolom
// `id` dan `tenant_id`, sehingga helper ini berlaku generik.
export async function findOwned<T extends PgTable & { id: PgColumn; tenant_id: PgColumn }>(
  table: T,
  id: string,
  tenantId: string,
  notFoundMsg = 'Data tidak ditemukan',
): Promise<T['$inferSelect']> {
  const db = useDb()
  const [row] = await db.select().from(table as PgTable)
    .where(and(eq(table.id, id), eq(table.tenant_id, tenantId)))
    .limit(1)
  if (!row) throw notFound(notFoundMsg)
  return row as T['$inferSelect']
}
