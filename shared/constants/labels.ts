// Label Bahasa Indonesia + warna untuk badge status.
// Warna fleet selaras internal/docs/design.md §2.
import type {
  FleetStatus, BookingStatus, BranchStatus, CustomerStatus,
  PaymentStatus, SubscriptionTier, UserRole,
} from './enums'

export const FLEET_STATUS_LABEL: Record<FleetStatus, string> = {
  available: 'Tersedia',
  booked: 'Dibooking',
  on_rent: 'Disewa',
  maintenance: 'Maintenance',
  inspection: 'Inspeksi',
}

// Hex sesuai design.md (Fleet Status Colors)
export const FLEET_STATUS_COLOR: Record<FleetStatus, string> = {
  available: '#16A34A',
  booked: '#3B82F6',
  on_rent: '#F59E0B',
  maintenance: '#DC2626',
  inspection: '#9CA3AF',
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  active: 'Berjalan',
  completed: 'Selesai',
  canceled: 'Dibatalkan',
}

export const BRANCH_STATUS_LABEL: Record<BranchStatus, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
}

export const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  active: 'Aktif',
  blacklisted: 'Blacklist',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'Menunggu',
  settled: 'Lunas',
  expired: 'Kedaluwarsa',
  refunded: 'Dikembalikan',
  failed: 'Gagal',
}

export const ROLE_LABEL: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  operator: 'Operator',
  viewer: 'Viewer',
}

// Pricing tier — dari brd.md §3.1
export const TIER_INFO: Record<SubscriptionTier, {
  label: string; pricePerMonth: number; maxBranches: number | null; maxVehicles: number | null
}> = {
  starter: { label: 'Starter', pricePerMonth: 150_000, maxBranches: 1, maxVehicles: 10 },
  pro: { label: 'Pro', pricePerMonth: 350_000, maxBranches: 3, maxVehicles: 50 },
  enterprise: { label: 'Enterprise', pricePerMonth: 750_000, maxBranches: null, maxVehicles: null },
}

export const TRIAL_DAYS = 14
