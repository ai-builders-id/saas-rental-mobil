<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { statusTone } from '~/composables/useRentalData'

const { gpsUnits, loading, init } = useRentalData()

onMounted(() => init())

// Default ke unit pertama setelah data siap
const sel = ref<string | null>(null)
const unit = computed(() => {
  if (!sel.value && gpsUnits.value.length > 0) {
    sel.value = gpsUnits.value[0].id
  }
  return gpsUnits.value.find((u) => u.id === sel.value) ?? null
})

const tone = statusTone
const isLoading = loading

// Leaflet map
const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
const markersById = new Map<string, any>()

function focusUnit(id: string | null) {
  if (!id || !map) return
  const marker = markersById.get(id)
  if (!marker) return
  map.panTo(marker.getLatLng(), { animate: true })
  marker.openPopup()
}

function initMap() {
  if (!mapContainer.value || typeof window === 'undefined' || map) return

  // Dynamic import Leaflet
  import('leaflet').then((L) => {
    // Fix marker icon paths for bundler
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    // Init map di koordinat Jakarta
    map = L.map(mapContainer.value, {
      zoomControl: true,
      attributionControl: true,
    }).setView([-6.2088, 106.8456], 11)

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    // Tambah marker untuk setiap GPS unit
    addMarkers(L)

    // Resize handler
    setTimeout(() => map?.invalidateSize(), 300)
  }).catch((err) => {
    console.warn('Leaflet load failed:', err)
  })
}

function addMarkers(L: any) {
  if (!map) return
  markersById.forEach((m) => map.removeLayer(m))
  markersById.clear()

  // Koordinat dummy tersebar di sekitar Jakarta
  const baseCoords: [number, number][] = [
    [-6.2146, 106.8451], // Sudirman
    [-6.2402, 106.9924], // Bekasi
    [-6.3439, 106.8256], // Depok
    [-6.1754, 106.8270], // Jakarta Pusat
    [-6.2303, 106.8143], // Kebayoran
    [-6.2785, 106.8695], // Pancoran
  ]

  // Warna marker per status
  const colors: Record<string, string> = {
    ON_RENT: '#D97706',
    AVAILABLE: '#16A34A',
    BOOKED: '#2563EB',
    MAINTENANCE: '#DC2626',
    INSPECTION: '#64748B',
  }

  gpsUnits.value.forEach((u, i) => {
    const idx = i % baseCoords.length
    const lat = baseCoords[idx][0]
    const lng = baseCoords[idx][1]

    const color = colors[u.status] || '#64748B'
    const icon = L.divIcon({
      className: 'gps-marker',
      html: `<div style="
        width: 14px; height: 14px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,.3);
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    })

    const marker = L.marker([lat, lng], { icon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; min-width: 160px;">
          <strong style="font-size: 14px;">${u.plate}</strong><br>
          ${u.vehicle}<br>
          <span style="color: ${color}; font-weight: 600;">${u.status === 'ON_RENT' ? 'Disewa' : u.status === 'AVAILABLE' ? 'Tersedia' : u.status}</span>
          ${u.driver ? '<br>🚗 ' + u.driver : ''}
          <br><small style="color:#666;">${u.speed} km/j · ${u.area}</small>
        </div>
      `)

    marker.on('click', () => {
      sel.value = u.id
    })

    markersById.set(u.id, marker)
  })

  if (sel.value) focusUnit(sel.value)
}

// Reactive watch: ketika gpsUnits berubah, refresh marker
watch(() => gpsUnits.value.length, (len) => {
  if (len > 0 && map) {
    import('leaflet').then((L) => addMarkers(L))
  }
})

watch(sel, (id) => focusUnit(id))

async function scheduleMapInit() {
  await nextTick()
  setTimeout(initMap, 100)
}

// Init map setelah mount & data ready
onMounted(() => {
  const unwatch = watch(isLoading, (v) => {
    if (!v && gpsUnits.value.length > 0) {
      scheduleMapInit()
      unwatch()
    }
  })
  if (!isLoading.value && gpsUnits.value.length > 0) {
    scheduleMapInit()
  }
})
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">GPS Live Tracking</h1>
        <p class="page-desc">{{ gpsUnits.length }} unit termonitor · peta OpenStreetMap</p>
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
          <div ref="mapContainer" class="gps-map-container" />
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

<style scoped>
.gps-map-container {
  width: 100%;
  height: 560px;
  border-radius: var(--r-card);
  z-index: 0;
}
/* Tailwind preflight sets img { max-width: 100% } — breaks Leaflet tiles */
.gps-map-container :deep(.leaflet-container img) {
  max-width: none !important;
  max-height: none !important;
}
.gps-map-container :deep(.leaflet-div-icon.gps-marker) {
  background: transparent;
  border: none;
}
.gps-map-container :deep(.leaflet-popup-content-wrapper) {
  border-radius: 9px;
  box-shadow: var(--shadow-pop);
}
.gps-map-container :deep(.leaflet-popup-content) {
  margin: 10px 12px;
}
</style>
