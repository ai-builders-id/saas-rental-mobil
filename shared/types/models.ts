// Tipe domain — bentuk baris tabel sebagaimana dikembalikan API.
// Selaras supabase/migrations/0001_init.sql.
import type {
  UserRole, SubscriptionTier, SubscriptionStatus, BranchStatus,
  FleetStatus, BookingStatus, PaymentType, PaymentStatus,
  CustomerStatus, DocumentType,
} from '../constants/enums'

export interface Tenant {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  timezone: string
  currency: string
  wa_number: string | null
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  tenant_id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Branch {
  id: string
  tenant_id: string
  name: string
  address: string | null
  phone: string | null
  lat: number | null
  lng: number | null
  operating_hours: Record<string, unknown> | null
  photo_url: string | null
  status: BranchStatus
  created_at: string
  updated_at: string
}

export interface Vehicle {
  id: string
  tenant_id: string
  branch_id: string | null
  brand: string
  model: string
  year: number
  plate_no: string
  color: string | null
  photos: string[]
  price_daily: number
  price_weekly: number | null
  price_monthly: number | null
  price_with_driver: number | null
  status: FleetStatus
  odometer: number
  created_at: string
  updated_at: string
}

export interface VehicleDocument {
  id: string
  tenant_id: string
  vehicle_id: string
  type: DocumentType
  file_url: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface MaintenanceRecord {
  id: string
  tenant_id: string
  vehicle_id: string
  scheduled_at: string
  type: string
  cost: number | null
  workshop: string | null
  notes: string | null
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  tenant_id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  ktp_url: string | null
  sim_url: string | null
  status: CustomerStatus
  blacklist_reason: string | null
  rating: number | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  tenant_id: string
  vehicle_id: string
  customer_id: string
  branch_id: string | null
  start_at: string
  end_at: string
  with_driver: boolean
  price_total: number
  dp_amount: number
  status: BookingStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  tenant_id: string
  booking_id: string
  type: PaymentType
  amount: number
  status: PaymentStatus
  provider: string | null
  external_ref: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

// Bentuk paginasi standar untuk endpoint list
export interface Paginated<T> {
  data: T[]
  page: number
  perPage: number
  total: number
}

// Konteks auth yang diisi server/middleware/auth.ts
export interface AuthContext {
  userId: string
  tenantId: string
  role: UserRole
}
