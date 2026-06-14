import { differenceInCalendarDays } from 'date-fns'
import type { Vehicle } from '#shared/types/models'

// Hitung total harga sewa dari tarif unit + durasi.
// Aturan sederhana (MVP): pakai tarif harian × jumlah hari (minimal 1 hari).
// Jika with_driver & price_with_driver tersedia, tambahkan selisihnya per hari.
// Tarif mingguan/bulanan dipakai bila durasi pas kelipatannya (optimasi harga).
export function computeBookingPrice(
  vehicle: Pick<Vehicle, 'price_daily' | 'price_weekly' | 'price_monthly' | 'price_with_driver'>,
  startAt: string,
  endAt: string,
  withDriver: boolean,
): number {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const days = Math.max(1, differenceInCalendarDays(end, start))

  let base: number

  const months = Math.floor(days / 30)
  const remAfterMonths = days % 30
  const weeks = Math.floor(remAfterMonths / 7)
  const remDays = remAfterMonths % 7

  if (vehicle.price_monthly && vehicle.price_weekly) {
    base =
      months * Number(vehicle.price_monthly) +
      weeks * Number(vehicle.price_weekly) +
      remDays * Number(vehicle.price_daily)
  } else if (vehicle.price_weekly) {
    const w = Math.floor(days / 7)
    const d = days % 7
    base = w * Number(vehicle.price_weekly) + d * Number(vehicle.price_daily)
  } else {
    base = days * Number(vehicle.price_daily)
  }

  if (withDriver && vehicle.price_with_driver) {
    // price_with_driver diperlakukan sebagai tarif harian "dengan sopir";
    // tambahkan selisih dengan tarif harian biasa × jumlah hari.
    const driverSurcharge = Math.max(0, Number(vehicle.price_with_driver) - Number(vehicle.price_daily))
    base += driverSurcharge * days
  }

  return Math.round(base)
}

// DP default 30% (frd.md FR-22), dibulatkan ke ribuan terdekat.
export function defaultDp(total: number, pct = 0.3): number {
  return Math.round((total * pct) / 1000) * 1000
}
