// ════════════════════════════════════════════════════════════════════════
// Drizzle schema — sumber kebenaran skema DB.
// Migrasi DDL digenerate dari sini: `npm run db:generate`.
//
// CATATAN: nama properti JS sengaja snake_case agar identik dengan nama kolom
// DB DAN kontrak JSON API (shared/types/models.ts). Dengan begitu hasil
// $inferSelect langsung cocok untuk respons, dan payload tervalidasi (snake_case)
// langsung bisa dipakai untuk .values()/.set() tanpa pemetaan nama.
// ════════════════════════════════════════════════════════════════════════
import {
  pgSchema, pgTable, pgEnum, uuid, text, integer, doublePrecision,
  numeric, boolean, timestamp, date, jsonb, index, unique,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ── Enums ───────────────────────────────────────────────────────────────
export const userRole = pgEnum('user_role', ['owner', 'admin', 'operator', 'viewer'])
export const subscriptionTier = pgEnum('subscription_tier', ['starter', 'pro', 'enterprise'])
export const subscriptionStatus = pgEnum('subscription_status', ['trialing', 'active', 'past_due', 'canceled'])
export const branchStatus = pgEnum('branch_status', ['active', 'inactive'])
export const fleetStatus = pgEnum('fleet_status', ['available', 'booked', 'on_rent', 'maintenance', 'inspection'])
export const bookingStatus = pgEnum('booking_status', ['pending', 'confirmed', 'active', 'completed', 'canceled'])
export const paymentType = pgEnum('payment_type', ['dp', 'settlement', 'deposit', 'fine', 'refund'])
export const paymentStatus = pgEnum('payment_status', ['pending', 'settled', 'expired', 'refunded', 'failed'])
export const customerStatus = pgEnum('customer_status', ['active', 'blacklisted'])
export const documentType = pgEnum('document_type', ['stnk', 'bpkb', 'insurance'])

// CATATAN: profiles.id mereferensikan auth.users.id (Supabase). FK tersebut
// TIDAK didefinisikan di sini agar drizzle-kit tidak mencoba membuat schema
// `auth`/tabel `users`. FK ditambahkan via SQL pelengkap (lihat
// supabase/migrations/zzz_supabase_extras.sql).

const timestamps = {
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}

// ── tenants ─────────────────────────────────────────────────────────────
export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  logo_url: text('logo_url'),
  timezone: text('timezone').notNull().default('Asia/Jakarta'),
  currency: text('currency').notNull().default('IDR'),
  wa_number: text('wa_number'),
  subscription_tier: subscriptionTier('subscription_tier').notNull().default('starter'),
  subscription_status: subscriptionStatus('subscription_status').notNull().default('trialing'),
  trial_ends_at: timestamp('trial_ends_at', { withTimezone: true }),
  ...timestamps,
})

// ── profiles (1:1 auth.users) ───────────────────────────────────────────
export const profiles = pgTable('profiles', {
  // id = auth.users.id (FK ditambahkan via SQL pelengkap, lihat catatan di atas)
  id: uuid('id').primaryKey(),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  role: userRole('role').notNull().default('owner'),
  full_name: text('full_name'),
  phone: text('phone'),
  is_active: boolean('is_active').notNull().default(true),
  ...timestamps,
}, (t) => [index('idx_profiles_tenant').on(t.tenant_id)])

// ── branches ────────────────────────────────────────────────────────────
export const branches = pgTable('branches', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  operating_hours: jsonb('operating_hours'),
  photo_url: text('photo_url'),
  status: branchStatus('status').notNull().default('active'),
  ...timestamps,
}, (t) => [index('idx_branches_tenant').on(t.tenant_id)])

// ── vehicles ────────────────────────────────────────────────────────────
export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  branch_id: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  plate_no: text('plate_no').notNull(),
  color: text('color'),
  photos: text('photos').array().notNull().default(sql`'{}'`),
  price_daily: numeric('price_daily', { precision: 12, scale: 2 }).notNull().default('0'),
  price_weekly: numeric('price_weekly', { precision: 12, scale: 2 }),
  price_monthly: numeric('price_monthly', { precision: 12, scale: 2 }),
  price_with_driver: numeric('price_with_driver', { precision: 12, scale: 2 }),
  status: fleetStatus('status').notNull().default('available'),
  odometer: integer('odometer').notNull().default(0),
  ...timestamps,
}, (t) => [
  unique('uq_vehicle_plate_per_tenant').on(t.tenant_id, t.plate_no),
  index('idx_vehicles_tenant').on(t.tenant_id),
  index('idx_vehicles_branch').on(t.branch_id),
  index('idx_vehicles_status').on(t.tenant_id, t.status),
])

// ── vehicle_documents ───────────────────────────────────────────────────
export const vehicleDocuments = pgTable('vehicle_documents', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  vehicle_id: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  type: documentType('type').notNull(),
  file_url: text('file_url').notNull(),
  expires_at: date('expires_at'),
  ...timestamps,
}, (t) => [
  index('idx_vehicle_docs_tenant').on(t.tenant_id),
  index('idx_vehicle_docs_vehicle').on(t.vehicle_id),
])

// ── maintenance_records ─────────────────────────────────────────────────
export const maintenanceRecords = pgTable('maintenance_records', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  vehicle_id: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  scheduled_at: date('scheduled_at').notNull(),
  type: text('type').notNull(),
  cost: numeric('cost', { precision: 12, scale: 2 }),
  workshop: text('workshop'),
  notes: text('notes'),
  completed: boolean('completed').notNull().default(false),
  completed_at: timestamp('completed_at', { withTimezone: true }),
  ...timestamps,
}, (t) => [
  index('idx_maintenance_tenant').on(t.tenant_id),
  index('idx_maintenance_vehicle').on(t.vehicle_id),
])

// ── customers ───────────────────────────────────────────────────────────
export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  address: text('address'),
  ktp_url: text('ktp_url'),
  sim_url: text('sim_url'),
  status: customerStatus('status').notNull().default('active'),
  blacklist_reason: text('blacklist_reason'),
  rating: numeric('rating', { precision: 2, scale: 1 }),
  ...timestamps,
}, (t) => [
  unique('uq_customer_phone_per_tenant').on(t.tenant_id, t.phone),
  index('idx_customers_tenant').on(t.tenant_id),
])

// ── bookings ────────────────────────────────────────────────────────────
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  vehicle_id: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'restrict' }),
  customer_id: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'restrict' }),
  branch_id: uuid('branch_id').references(() => branches.id, { onDelete: 'set null' }),
  start_at: timestamp('start_at', { withTimezone: true }).notNull(),
  end_at: timestamp('end_at', { withTimezone: true }).notNull(),
  with_driver: boolean('with_driver').notNull().default(false),
  price_total: numeric('price_total', { precision: 12, scale: 2 }).notNull().default('0'),
  dp_amount: numeric('dp_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  status: bookingStatus('status').notNull().default('pending'),
  notes: text('notes'),
  ...timestamps,
}, (t) => [
  index('idx_bookings_tenant').on(t.tenant_id),
  index('idx_bookings_vehicle').on(t.vehicle_id),
  index('idx_bookings_customer').on(t.customer_id),
  index('idx_bookings_range').on(t.tenant_id, t.start_at, t.end_at),
])

// ── payments ────────────────────────────────────────────────────────────
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  tenant_id: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  booking_id: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  type: paymentType('type').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: paymentStatus('status').notNull().default('pending'),
  provider: text('provider'),
  external_ref: text('external_ref'),
  paid_at: timestamp('paid_at', { withTimezone: true }),
  ...timestamps,
}, (t) => [
  index('idx_payments_tenant').on(t.tenant_id),
  index('idx_payments_booking').on(t.booking_id),
])

// Tipe row hasil inferensi Drizzle
export type TenantRow = typeof tenants.$inferSelect
export type ProfileRow = typeof profiles.$inferSelect
export type BranchRow = typeof branches.$inferSelect
export type VehicleRow = typeof vehicles.$inferSelect
export type BookingRow = typeof bookings.$inferSelect
export type CustomerRow = typeof customers.$inferSelect
export type PaymentRow = typeof payments.$inferSelect
