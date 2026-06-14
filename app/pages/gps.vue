<script setup lang="ts">
import { statusTone } from '~/composables/useRentalData'

const { gpsUnits, loading, init } = useRentalData()

onMounted(() => init())

// Default ke unit pertama setelah data siap (guard untuk array kosong)
const sel = ref<string | null>(null)
const unit = computed(() => {
  if (!sel.value && gpsUnits.value.length > 0) {
    sel.value = gpsUnits.value[0].id
  }
  return gpsUnits.value.find((u) => u.id === sel.value) ?? null
})

const tone = statusTone

// computed agar template bisa akses loading state
const isLoading = loading
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">GPS Live Tracking</h1>
        <p class="page-desc">{{ gpsUnits.length }} unit termonitor · update tiap 30 dtk</p>
      </div>
      <div class="row gap-8">
        <RButton variant="ghost" icon="locate-fixed">Geofence</RButton>
        <RButton variant="ghost" icon="history">Riwayat</RButton>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="empty">
      <div class="empty-ico"><RIcon name="loader-circle" :size="28" /></div>
      <h2>Memuat data GPS...</h2>
      <p>Menyiapkan peta dan daftar unit</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="gpsUnits.length === 0" class="empty">
      <div class="empty-ico"><RIcon name="map-pin-off" :size="28" /></div>
      <h2>Tidak ada unit GPS</h2>
      <p>Belum ada kendaraan dengan GPS tracker aktif.</p>
    </div>

    <!-- Data tersedia -->
    <template v-else>
      <div class="gps-layout">
        <RCard :pad="false" class="gps-map-card">
          <div class="gps-map">
            <div class="gps-map-ph">
              <div class="gps-grid-lines" />
              <span class="gps-ph-label">PETA GPS · Google Maps JS API</span>
            </div>
            <button
              v-for="u in gpsUnits"
              :key="u.id"
              class="gps-pin"
              :class="'tone-' + tone(u.status) + (u.id === sel ? ' is-sel' : '')"
              :style="{ left: u.x + '%', top: u.y + '%' }"
              :title="u.plate"
              @click="sel = u.id"
            >
              <RIcon name="navigation" :size="13" />
              <span class="gps-pin-label">{{ u.plate.replace('B ', '') }}</span>
            </button>
            <div class="gps-zoom">
              <button class="icon-btn"><RIcon name="plus" :size="16" /></button>
              <button class="icon-btn"><RIcon name="minus" :size="16" /></button>
            </div>
          </div>
        </RCard>

        <div class="gps-side">
          <RCard title="Unit Aktif" body-class="flush">
            <ul v-if="gpsUnits.length > 0" class="gps-list">
              <li
                v-for="u in gpsUnits"
                :key="u.id"
                class="gps-row"
                :class="{ 'is-sel': u.id === sel }"
                @click="sel = u.id"
              >
                <span class="gps-dot" :class="'tone-' + tone(u.status)" />
                <div class="gps-row-body">
                  <span class="plate">{{ u.plate }}</span>
                  <span class="gps-row-sub">{{ u.vehicle }} · {{ u.area }}</span>
                </div>
                <span class="gps-speed">{{ u.speed }}<small> km/j</small></span>
              </li>
            </ul>
            <div v-else class="empty" style="padding: 40px 20px;">
              <p class="muted">Tidak ada unit terdaftar</p>
            </div>
          </RCard>

          <RCard v-if="unit" title="Detail Unit">
            <div class="gps-detail-head">
              <div>
                <span class="plate lg">{{ unit.plate }}</span>
                <span class="veh-sub">{{ unit.vehicle }}</span>
              </div>
              <StatusBadge :status="unit.status" />
            </div>
            <dl class="kv">
              <div><dt>Pengemudi</dt><dd>{{ unit.driver || '—' }}</dd></div>
              <div><dt>Lokasi</dt><dd>{{ unit.area }}</dd></div>
              <div><dt>Kecepatan</dt><dd class="num">{{ unit.speed }} km/j</dd></div>
              <div><dt>Jarak hari ini</dt><dd class="num">{{ unit.kmToday }} km</dd></div>
              <div><dt>Update terakhir</dt><dd class="muted">{{ unit.updated }}</dd></div>
            </dl>
            <div class="row gap-8">
              <RButton variant="default" icon="route" size="sm">Riwayat Rute</RButton>
              <RButton variant="ghost" icon="bell" size="sm">Notifikasi</RButton>
            </div>
          </RCard>
        </div>
      </div>
    </template>
  </div>
</template>
