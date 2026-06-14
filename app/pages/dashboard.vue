<script setup lang="ts">
import { rupiah } from '~/utils/format'

const { summary: s, revenue14, alerts, activeRentals, fleetMix, activity, loading, error, init, fetchAll } = useRentalData()

// Fetch on mount (tunggu layout ready)
onMounted(() => init())

const revOptions = [
  { value: '14d', label: '14 hari' },
  { value: '30d', label: '30 hari' },
  { value: 'yr', label: 'Tahun' },
]
const revRange = ref('14d')

function feedIcon(kind: string) {
  if (kind === 'bot') return 'bot'
  if (kind === 'payment') return 'banknote'
  if (kind === 'confirmed') return 'check'
  return 'message-circle'
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Ringkasan Operasional</h1>
        <p class="page-desc" v-if="!loading">
          {{ new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
          · {{ s.total }} unit armada
        </p>
        <p class="page-desc" v-else>Memuat data...</p>
      </div>
      <div class="row gap-8">
        <RButton variant="ghost" icon="download">Ekspor</RButton>
        <RButton variant="primary" icon="plus">Booking Baru</RButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="empty">
      <div class="empty-ico"><RIcon name="loader-circle" :size="28" /></div>
      <h2>Memuat data dashboard...</h2>
      <p>Menyiapkan ringkasan operasional untuk Anda</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="empty">
      <div class="empty-ico"><RIcon name="alert-triangle" :size="28" /></div>
      <h2>Gagal memuat data</h2>
      <p>{{ error }}</p>
      <RButton variant="primary" @click="fetchAll">Coba Lagi</RButton>
    </div>

    <!-- Empty state -->
    <template v-else-if="s.total === 0 && !loading">
      <div class="empty">
        <div class="empty-ico"><RIcon name="car-front" :size="28" /></div>
        <h2>Belum ada data armada</h2>
        <p>Tambahkan kendaraan pertama Anda untuk mulai menggunakan dashboard.</p>
        <RButton variant="primary" icon="plus">Tambah Kendaraan</RButton>
      </div>
    </template>

    <!-- Actual content -->
    <template v-else>
      <!-- stat cards -->
      <div class="grid-stats">
        <StatCard
          label="Armada siap sewa" :value="s.available" icon="circle-check-big"
          tone="available" :spark="[8, 9, 7, 10, 11, 10, 12]"
        >
          <template #sub>
            <span class="delta up"><RIcon name="trending-up" :size="13" />normal</span>
          </template>
        </StatCard>
        <StatCard
          label="Sedang disewa" :value="s.onRent" icon="key-round"
          tone="onrent" :spark="[5, 6, 8, 7, 9, 8, 8]"
        >
          <template #sub>
            <span class="muted">{{ s.total > 0 ? Math.round((s.onRent / s.total) * 100) : 0 }}% utilisasi</span>
          </template>
        </StatCard>
        <StatCard
          label="Servis / inspeksi" :value="s.maintenance" icon="wrench"
          tone="maintenance" :spark="[2, 3, 2, 4, 3, 3, 3]"
        >
          <template #sub>
            <span class="muted">{{ s.maintenance > 0 ? 'Ada kendaraan dalam servis' : 'Semua dalam kondisi baik' }}</span>
          </template>
        </StatCard>
        <StatCard
          label="Pendapatan bulan ini" :value="rupiah(s.revenueMonth, { short: true })"
          icon="wallet" tone="primary" :spark="revenue14.map((d) => d.value)"
        >
          <template #sub>
            <span v-if="s.revenueDelta !== 0" class="delta up">
              <RIcon name="trending-up" :size="13" />{{ s.revenueDelta > 0 ? '+' : '' }}{{ s.revenueDelta }}%
            </span>
            <span v-else class="muted">Data baru tersedia</span>
          </template>
        </StatCard>
      </div>

      <!-- revenue + alerts -->
      <div class="grid-8-4">
        <RCard title="Pendapatan" subtitle="14 hari terakhir">
          <template #action>
            <Segmented v-model="revRange" :options="revOptions" />
          </template>
          <div class="rev-summary">
            <div>
              <span class="rev-big">{{ rupiah(s.revenueMonth) }}</span>
              <span v-if="s.revenueDelta !== 0" class="delta up">
                <RIcon name="trending-up" :size="14" />{{ s.revenueDelta > 0 ? '+' : '' }}{{ s.revenueDelta }}% vs bulan lalu
              </span>
            </div>
            <div class="rev-legend">
              <span><i class="dot" :style="{ background: 'var(--primary)' }" />Realisasi</span>
            </div>
          </div>
          <BarChart v-if="revenue14.length > 0" :data="revenue14" :height="196" />
          <div v-else class="empty" style="padding: 40px 20px;">
            <p class="muted">Belum ada data pendapatan untuk periode ini</p>
          </div>
        </RCard>

        <RCard title="Peringatan" :subtitle="alerts.length > 0 ? `${alerts.length} butuh perhatian` : 'Semua baik'" body-class="flush">
          <template #action><button class="link-btn">Lihat semua</button></template>
          <ul v-if="alerts.length > 0" class="alert-list">
            <li v-for="a in alerts" :key="a.id" class="alert" :class="`sev-${a.sev}`">
              <span class="alert-ico"><RIcon :name="a.icon" :size="16" /></span>
              <div class="alert-body">
                <p class="alert-title">{{ a.title }}</p>
                <p class="alert-desc">{{ a.desc }}</p>
              </div>
              <span class="alert-time">{{ a.time }}</span>
            </li>
          </ul>
          <div v-else class="empty" style="padding: 40px 20px;">
            <p class="muted">Tidak ada peringatan</p>
          </div>
        </RCard>
      </div>

      <!-- active rentals + fleet mix -->
      <div class="grid-8-4">
        <RCard title="Sewa Aktif" :subtitle="activeRentals.length > 0 ? 'Unit yang sedang di jalan' : 'Tidak ada sewa aktif'" body-class="flush">
          <template #action><button class="link-btn">Buka semua</button></template>
          <table v-if="activeRentals.length > 0" class="tbl">
            <thead>
              <tr>
                <th>Kendaraan</th><th>Pelanggan</th><th>Cabang</th>
                <th>Jatuh tempo</th><th class="w-progress">Progress</th><th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in activeRentals" :key="r.id">
                <td>
                  <div class="cell-veh">
                    <span class="plate">{{ r.plate }}</span>
                    <span class="veh-name">{{ r.vehicle }}</span>
                  </div>
                </td>
                <td>
                  <div class="cell-cust">
                    <RAvatar :name="r.customer" :size="26" />
                    <span>{{ r.customer }}</span>
                    <RIcon v-if="r.channel === 'wa'" name="message-circle" :size="13" class="wa-mini" />
                  </div>
                </td>
                <td class="muted">{{ r.branch }}</td>
                <td>
                  <span class="due" :class="{ overdue: r.overdue }">
                    <RIcon v-if="r.overdue" name="alarm-clock" :size="13" />
                    {{ r.due }}
                  </span>
                </td>
                <td>
                  <div class="progress">
                    <div class="progress-bar" :class="{ 'is-over': r.overdue }" :style="{ width: `${r.progress}%` }" />
                  </div>
                </td>
                <td class="ta-right">
                  <button class="icon-btn"><RIcon name="ellipsis" :size="16" /></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="empty" style="padding: 40px 20px;">
            <p class="muted">Belum ada kendaraan yang sedang disewa</p>
          </div>
        </RCard>

        <div class="stack-12">
          <RCard title="Komposisi Armada">
            <template v-if="fleetMix.length > 0">
              <div class="mix">
                <Donut :data="fleetMix" />
                <ul class="mix-legend">
                  <li v-for="m in fleetMix" :key="m.tone">
                    <i class="dot" :style="{ background: `var(--st-${m.tone})` }" />
                    <span class="mix-label">{{ m.label }}</span>
                    <span class="mix-val">{{ m.value }}</span>
                  </li>
                  <li class="mix-foot">
                    <span class="mix-label">Utilisasi</span>
                    <span class="mix-val accent">{{ s.utilization }}%</span>
                  </li>
                </ul>
              </div>
            </template>
            <div v-else class="empty" style="padding: 40px 20px;">
              <p class="muted">Belum ada data armada</p>
            </div>
          </RCard>

          <RCard title="Aktivitas" :subtitle="activity.length > 0 ? `${activity.length} aktivitas terbaru` : 'Belum ada aktivitas'" body-class="flush">
            <ul v-if="activity.length > 0" class="feed">
              <li v-for="f in activity" :key="f.id" class="feed-item">
                <span class="feed-ico" :class="`k-${f.kind}`">
                  <RIcon :name="feedIcon(f.kind)" :size="14" />
                </span>
                <div class="feed-body">
                  <p class="feed-text"><b>{{ f.who }}</b> {{ f.text }}</p>
                  <span class="feed-time">{{ f.time }}</span>
                </div>
              </li>
            </ul>
            <div v-else class="empty" style="padding: 40px 20px;">
              <p class="muted">Belum ada aktivitas</p>
            </div>
          </RCard>
        </div>
      </div>
    </template>
  </div>
</template>
