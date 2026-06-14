<script setup lang="ts">
import { statusTone, type FleetStatusId, type BookingEntry } from '~/composables/useRentalData'

const { bookings, loading, init } = useRentalData()

onMounted(() => init())

const viewOptions = [
  { value: 'month', label: 'Bulan' },
  { value: 'week', label: 'Minggu' },
]
const view = ref('month')

const daysInMonth = 30 // Juni 2026
const offset = 1 // 1 Juni 2026 jatuh pada Senin (minggu mulai dari Minggu)

const byDay = computed(() => {
  const map: Record<number, BookingEntry[]> = {}
  const list = bookings.value
  if (Array.isArray(list)) {
    list.forEach((b) => {
      ;(map[b.day] = map[b.day] || []).push(b)
    })
  }
  return map
})

const cells: (number | null)[] = []
for (let i = 0; i < offset; i++) cells.push(null)
for (let d = 1; d <= daysInMonth; d++) cells.push(d)

const dow = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const tone = (s: FleetStatusId) => statusTone(s)
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Kalender Booking</h1>
        <p class="page-desc">
          <template v-if="loading">Memuat...</template>
          <template v-else>Juni 2026 · {{ Array.isArray(bookings) ? bookings.length : 0 }} jadwal</template>
        </p>
      </div>
      <div class="row gap-8">
        <Segmented v-model="view" :options="viewOptions" />
        <RButton variant="primary" icon="plus">Booking Baru</RButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="empty">
      <div class="empty-ico"><RIcon name="loader-circle" :size="28" /></div>
      <h2>Memuat jadwal booking...</h2>
    </div>

    <!-- Empty state -->
    <div v-else-if="!Array.isArray(bookings) || bookings.length === 0" class="empty">
      <div class="empty-ico"><RIcon name="calendar" :size="28" /></div>
      <h2>Belum ada booking</h2>
      <p>Jadwal booking akan muncul di kalender setelah pelanggan melakukan pemesanan.</p>
      <RButton variant="primary" icon="plus">Booking Baru</RButton>
    </div>

    <template v-else>

    <RCard :pad="false">
      <div class="cal-head">
        <div class="row gap-8 ai-center">
          <button class="icon-btn"><RIcon name="chevron-left" :size="18" /></button>
          <strong class="cal-month">Juni 2026</strong>
          <button class="icon-btn"><RIcon name="chevron-right" :size="18" /></button>
          <button class="link-btn">Hari ini</button>
        </div>
        <div class="cal-legend">
          <span><i class="dot" :style="{ background: 'var(--st-available)' }" />Tersedia</span>
          <span><i class="dot" :style="{ background: 'var(--st-booked)' }" />Dibooking</span>
          <span><i class="dot" :style="{ background: 'var(--st-onrent)' }" />Disewa</span>
          <span><i class="dot" :style="{ background: 'var(--st-maintenance)' }" />Servis</span>
        </div>
      </div>

      <div class="cal-grid">
        <div v-for="d in dow" :key="d" class="cal-dow">{{ d }}</div>
        <div
          v-for="(d, i) in cells"
          :key="i"
          class="cal-cell"
          :class="{ 'is-today': d === 14, 'is-empty': d === null }"
        >
          <template v-if="d !== null">
            <span class="cal-date">{{ d }}</span>
            <div class="cal-events">
              <div
                v-for="(b, j) in (byDay[d] || []).slice(0, 3)"
                :key="j"
                class="cal-chip"
                :class="'tone-' + tone(b.status)"
                :title="b.plate + ' · ' + b.customer"
              >
                <RIcon v-if="b.channel === 'wa'" name="message-circle" :size="11" />
                <span class="cal-chip-plate">{{ b.plate.replace('B ', '') }}</span>
                <span class="cal-chip-cust">{{ b.customer }}</span>
              </div>
              <span v-if="(byDay[d] || []).length > 3" class="cal-more">
                +{{ byDay[d].length - 3 }} lagi
              </span>
            </div>
          </template>
        </div>
      </div>
    </RCard>
    </template>
  </div>
</template>
