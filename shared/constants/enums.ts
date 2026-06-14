// Enum domain — selaras dengan tipe Postgres di supabase/migrations/0001_init.sql.
// Dipakai bersama oleh server (validasi) dan frontend (label/badge).

export const USER_ROLES = ['owner', 'admin', 'operator', 'viewer'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const SUBSCRIPTION_TIERS = ['starter', 'pro', 'enterprise'] as const
export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number]

export const SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'canceled'] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const BRANCH_STATUSES = ['active', 'inactive'] as const
export type BranchStatus = (typeof BRANCH_STATUSES)[number]

export const FLEET_STATUSES = ['available', 'booked', 'on_rent', 'maintenance', 'inspection'] as const
export type FleetStatus = (typeof FLEET_STATUSES)[number]

export const BOOKING_STATUSES = ['pending', 'confirmed', 'active', 'completed', 'canceled'] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const PAYMENT_TYPES = ['dp', 'settlement', 'deposit', 'fine', 'refund'] as const
export type PaymentType = (typeof PAYMENT_TYPES)[number]

export const PAYMENT_STATUSES = ['pending', 'settled', 'expired', 'refunded', 'failed'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const CUSTOMER_STATUSES = ['active', 'blacklisted'] as const
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number]

export const DOCUMENT_TYPES = ['stnk', 'bpkb', 'insurance'] as const
export type DocumentType = (typeof DOCUMENT_TYPES)[number]

// ── Transisi status booking yang valid (workflow) ──
// pending → confirmed → active → completed ; pending/confirmed → canceled
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'canceled'],
  confirmed: ['active', 'canceled'],
  active: ['completed'],
  completed: [],
  canceled: [],
}
