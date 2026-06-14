<script setup lang="ts">
import { rupiah } from '~/utils/format'

const { vehicles, summary, branches, STATUS, loading, init } = useRentalData()

// Init singleton agar data tersedia walau akses langsung ke halaman ini
onMounted(() => init())

const view = ref('table')
const q = ref('')
const branch = ref('all')
const status = ref('all')

const viewOptions = [
  { value: 'table', icon: 'list' },
  { value: 'grid', icon: 'layout-grid' },
]

const branchName = (id: string) => {
  const b = branches.value.find((b) => b.id === id)
  return b?.name ?? b?.short ?? id
}

const rows = computed(() =>
  vehicles.value.filter((v) => {
    if (branch.value !== 'all' && v.branch !== branch.value) return false
    if (status.value !== 'all' && v.status !== status.value) return false
    if (q.value && !`${v.merk} ${v.model} ${v.plate}`.toLowerCase().includes(q.value.toLowerCase())) return false
    return true
  }),
)

const totalVehicles = computed(() => vehicles.value.length)
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Armada</h1>
        <p class="page-desc">{{ totalVehicles }} unit</p>
      </div>
      <div class="row gap-8">
        <RButton variant="ghost" icon="arrow-left-right">Transfer</RButton>
        <RButton variant="primary" icon="plus">Tambah Kendaraan</RButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty">
      <div class="empty-ico"><RIcon name="loader-circle" :size="28" /></div>
      <h2>Memuat daftar armada...</h2>
    </div>

    <!-- Empty -->
    <div v-else-if="vehicles.length === 0" class="empty">
      <div class="empty-ico"><RIcon name="car-front" :size="28" /></div>
      <h2>Belum ada kendaraan</h2>
      <p>Tambahkan kendaraan pertama Anda untuk mulai mengelola armada.</p>
      <RButton variant="primary" icon="plus">Tambah Kendaraan</RButton>
    </div>

    <template v-else>
      <div class="toolbar">
        <div class="search">
          <RIcon name="search" :size="16" />
          <input v-model="q" placeholder="Cari merk, model, atau plat…">
        </div>
        <select v-model="branch" class="select">
          <option value="all">Semua cabang</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <select v-model="status" class="select">
          <option value="all">Semua status</option>
          <option v-for="s in Object.values(STATUS)" :key="s.id" :value="s.id">{{ s.label }}</option>
        </select>
        <div class="spacer" />
        <Segmented v-model="view" :options="viewOptions" />
      </div>

      <RCard v-if="view === 'table'" :pad="false">
        <table class="tbl tbl-lg">
          <thead>
            <tr>
              <th class="w-idx">#</th><th>Kendaraan</th><th>Plat</th>
              <th>Cabang</th><th>Tarif / hari</th><th>Odometer</th><th>Status</th><th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="(v, i) in rows" :key="v.id" style="cursor: pointer;" @click="navigateTo(`/fleet/${v.id}`)">
              <td class="muted">{{ i + 1 }}</td>
              <td>
                <div class="cell-veh-img">
                  <span class="veh-thumb"><RIcon name="car-front" :size="18" /></span>
                  <div>
                    <span class="veh-name">{{ v.merk }} {{ v.model }}</span>
                    <span class="veh-sub">{{ v.year }} · {{ v.color }}</span>
                  </div>
                </div>
              </td>
              <td><span class="plate">{{ v.plate }}</span></td>
              <td class="muted">{{ branchName(v.branch) }}</td>
              <td class="num">{{ rupiah(v.day) }}</td>
              <td class="num muted">{{ v.odo.toLocaleString('id-ID') }} km</td>
              <td><StatusBadge :status="v.status" /></td>
              <td class="ta-right" @click.stop>
                <div class="row-actions">
                  <NuxtLink :to="`/fleet/${v.id}`" class="icon-btn" title="Lihat"><RIcon name="eye" :size="16" /></NuxtLink>
                  <button class="icon-btn" title="Edit"><RIcon name="pencil" :size="15" /></button>
                  <button class="icon-btn" title="Lainnya"><RIcon name="ellipsis" :size="16" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="tbl-foot">
          <span class="muted">Menampilkan {{ rows.length }} dari {{ totalVehicles }} kendaraan</span>
          <div class="pager">
            <button class="icon-btn"><RIcon name="chevron-left" :size="16" /></button>
            <button class="page-num is-on">1</button>
            <button class="page-num">2</button>
            <span class="muted">…</span>
            <button class="page-num">8</button>
            <button class="icon-btn"><RIcon name="chevron-right" :size="16" /></button>
          </div>
        </div>
      </RCard>

      <div v-else class="fleet-grid">
        <NuxtLink v-for="v in rows" :key="v.id" class="vcard" :to="`/fleet/${v.id}`" style="color: inherit; text-decoration: none; display: block;">
          <div class="vcard-img">
            <PhotoSlot :label="`Foto ${v.model}`" />
            <span class="vcard-status"><StatusBadge :status="v.status" /></span>
          </div>
          <div class="vcard-body">
            <div class="vcard-row">
              <span class="veh-name">{{ v.merk }} {{ v.model }}</span>
              <span class="plate">{{ v.plate }}</span>
            </div>
            <div class="vcard-meta">
              <span><RIcon name="map-pin" :size="13" />{{ branchName(v.branch) }}</span>
              <span><RIcon name="calendar" :size="13" />{{ v.year }}</span>
            </div>
            <div class="vcard-foot">
              <span class="num accent">{{ rupiah(v.day) }}<small>/hari</small></span>
              <span class="icon-btn"><RIcon name="arrow-right" :size="16" /></span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
