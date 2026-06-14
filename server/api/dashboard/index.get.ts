import { and, eq, count, sql, gte, lte, desc } from 'drizzle-orm'
import { useDb } from '../../db'
import { vehicles, bookings, customers, payments } from '../../db/schema'
import { subDays } from 'date-fns'

// GET /api/dashboard — ringkasan dashboard komprehensif.
export default defineEventHandler(async (event) => {
  const ctx = requireAuth(event)
  const db = useDb()
  const tid = ctx.tenantId

  const tenantWhere = eq(vehicles.tenant_id, tid)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Fleet counts
  const fleetCounts = await Promise.all([
    db.select({ n: count() }).from(vehicles).where(and(tenantWhere)),
    db.select({ n: count() }).from(vehicles).where(and(tenantWhere, eq(vehicles.status, 'available'))),
    db.select({ n: count() }).from(vehicles).where(and(tenantWhere, eq(vehicles.status, 'on_rent'))),
    db.select({ n: count() }).from(vehicles).where(and(tenantWhere, eq(vehicles.status, 'booked'))),
    db.select({ n: count() }).from(vehicles).where(and(tenantWhere, eq(vehicles.status, 'maintenance'))),
    db.select({ n: count() }).from(vehicles).where(and(tenantWhere, eq(vehicles.status, 'inspection'))),
  ])

  const total = fleetCounts[0][0]?.n ?? 0
  const available = fleetCounts[1][0]?.n ?? 0
  const onRent = fleetCounts[2][0]?.n ?? 0
  const booked = fleetCounts[3][0]?.n ?? 0
  const maintenance = fleetCounts[4][0]?.n ?? 0
  const inspection = fleetCounts[5][0]?.n ?? 0

  // Revenue: total bulan ini
  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount), 0)` })
    .from(payments)
    .where(and(
      eq(payments.tenant_id, tid),
      eq(payments.status, 'settled'),
      gte(payments.paid_at, startOfMonth),
    ))

  // Revenue: total bulan lalu
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  const [revenueLastMonth] = await db
    .select({ total: sql<number>`coalesce(sum(amount), 0)` })
    .from(payments)
    .where(and(
      eq(payments.tenant_id, tid),
      eq(payments.status, 'settled'),
      gte(payments.paid_at, startOfLastMonth),
      lte(payments.paid_at, endOfLastMonth),
    ))

  const revenueMonth = Number(revenueResult?.total ?? 0)
  const revenueLast = Number(revenueLastMonth?.total ?? 0)
  const revenueDelta = revenueLast > 0 ? Math.round(((revenueMonth - revenueLast) / revenueLast) * 100) : 0

  // Bookings today
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [bookingsToday] = await db
    .select({ n: count() })
    .from(bookings)
    .where(and(
      eq(bookings.tenant_id, tid),
      gte(bookings.created_at, todayStart),
    ))

  // Revenue 14 hari — per hari
  const rev14Days: { value: number; day: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = subDays(now, i)
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    const [dayRev] = await db
      .select({ total: sql<number>`coalesce(sum(amount), 0)` })
      .from(payments)
      .where(and(
        eq(payments.tenant_id, tid),
        eq(payments.status, 'settled'),
        gte(payments.paid_at, dayStart),
        lte(payments.paid_at, dayEnd),
      ))
    rev14Days.push({ day: 14 - i, value: Math.round(Number(dayRev?.total ?? 0) / 1000) })
  }

  // Active rentals (booking status = 'active')
  const activeRentalsData = await db
    .select({
      id: bookings.id,
      plate: sql<string>`${vehicles.plate_no}`,
      vehicle: sql<string>`concat(${vehicles.brand}, ' ', ${vehicles.model})`,
      customer_name: sql<string>`${customers.name}`,
      customer_phone: sql<string>`${customers.phone}`,
      start_at: bookings.start_at,
      end_at: bookings.end_at,
    })
    .from(bookings)
    .innerJoin(vehicles, eq(bookings.vehicle_id, vehicles.id))
    .innerJoin(customers, eq(bookings.customer_id, customers.id))
    .where(and(eq(bookings.tenant_id, tid), eq(bookings.status, 'active')))
    .orderBy(desc(bookings.end_at))
    .limit(10)

  const activeRentals = activeRentalsData.map((r) => {
    const end = new Date(r.end_at)
    const totalMs = end.getTime() - new Date(r.start_at).getTime()
    const elapsedMs = now.getTime() - new Date(r.start_at).getTime()
    const progress = totalMs > 0 ? Math.min(100, Math.round((elapsedMs / totalMs) * 100)) : 100
    const overdue = now > end
    const diffMs = overdue ? now.getTime() - end.getTime() : end.getTime() - now.getTime()
    const diffHours = Math.round(diffMs / 3600000)
    let due: string
    if (overdue) {
      due = diffHours < 24 ? `${diffHours}j lalu` : `${Math.round(diffHours / 24)}h lalu`
    } else {
      due = diffHours < 24 ? `${diffHours}j lagi` : `${Math.round(diffHours / 24)}h lagi`
    }

    return {
      id: r.id,
      plate: r.plate,
      vehicle: r.vehicle,
      customer: r.customer_name,
      branch: '',
      due,
      overdue,
      progress,
      channel: 'manual' as const,
    }
  })

  // Fleet mix
  const fleetMix = [
    { tone: 'available' as const, label: 'Tersedia', value: available },
    { tone: 'onrent' as const, label: 'Disewa', value: onRent },
    { tone: 'booked' as const, label: 'Dibooking', value: booked },
    { tone: 'maintenance' as const, label: 'Servis', value: maintenance },
    { tone: 'inspection' as const, label: 'Inspeksi', value: inspection },
  ].filter((m) => m.value > 0)

  const utilization = total > 0 ? Math.round(((onRent / total) * 100)) : 0

  // Alerts — booking jatuh tempo hari ini, STNK kedaluwarsa, maintenance
  const alerts: {
    id: string; sev: 'error' | 'warning' | 'info'; icon: string
    title: string; desc: string; time: string
  }[] = []

  // Bookings ending today
  const endingToday = await db
    .select({
      id: bookings.id,
      plate: sql<string>`${vehicles.plate_no}`,
      vehicle: sql<string>`concat(${vehicles.brand}, ' ', ${vehicles.model})`,
      customer_name: sql<string>`${customers.name}`,
      end_at: bookings.end_at,
    })
    .from(bookings)
    .innerJoin(vehicles, eq(bookings.vehicle_id, vehicles.id))
    .innerJoin(customers, eq(bookings.customer_id, customers.id))
    .where(and(
      eq(bookings.tenant_id, tid),
      eq(bookings.status, 'active'),
      lte(bookings.end_at, todayStart.getTime() + 86400000),
      gte(bookings.end_at, todayStart),
    ))
    .limit(5)

  endingToday.forEach((b) => {
    alerts.push({
      id: `alert-end-${b.id}`,
      sev: 'error',
      icon: 'i-lucide-alarm-clock',
      title: 'Sewa jatuh tempo hari ini',
      desc: `${b.plate} · ${b.vehicle} · ${b.customer_name}`,
      time: `Sebentar lagi`,
    })
  })

  // Kendaraan dalam maintenance
  if (maintenance > 0) {
    alerts.push({
      id: 'alert-maint',
      sev: 'warning',
      icon: 'i-lucide-wrench',
      title: `${maintenance} kendaraan dalam servis`,
      desc: 'Butuh pemeriksaan sebelum bisa disewakan kembali',
      time: 'Hari ini',
    })
  }

  // Activity — recent payments & booking changes
  const recentPayments = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      created_at: payments.created_at,
    })
    .from(payments)
    .where(and(eq(payments.tenant_id, tid), eq(payments.status, 'settled')))
    .orderBy(desc(payments.created_at))
    .limit(5)

  const activity = recentPayments.map((p) => ({
    id: `pay-${p.id}`,
    time: formatTime(p.created_at),
    who: 'Sistem',
    text: `Pembayaran diterima — Rp ${Number(p.amount).toLocaleString('id-ID')}`,
    kind: 'payment' as const,
  }))

  return {
    summary: {
      total,
      available,
      onRent,
      maintenance,
      revenueMonth,
      revenueDelta,
      utilization,
      bookingsToday: bookingsToday[0]?.n ?? 0,
      waShare: 0,
    },
    revenue14: rev14Days,
    alerts,
    activeRentals,
    fleetMix,
    activity,
  }
})

function formatTime(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
