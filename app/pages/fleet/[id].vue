<script setup lang="ts">
import { rupiah } from '~/utils/format'

const route = useRoute()
const { vehicles, branches } = useRentalData()

const vehicle = computed(() => vehicles.value.find((v) => v.id === route.params.id))
const branchName = (id: string) => branches.value.find((b) => b.id === id)?.name ?? id

// Fabricated demo data (swap for API when backend is wired up).
const history = [
  { date: '14 Jun 2026', customer: 'Andi Wijaya', days: 3, total: 1050000 },
  { date: '10 Jun 2026', customer: 'Budi Santoso', days: 2, total: 700000 },
  { date: '05 Jun 2026', customer: 'Citra Lestari', days: 5, total: 1750000 },
]

const maintenance = [
  { label: 'Ganti oli berikutnya', value: '15 Jul 2026' },
  { label: 'Rotasi ban', value: '20 Agu 2026' },
  { label: 'Servis terakhir', value: '10 Mei 2026' },
]
</script>

<template>
  <div v-if="vehicle" class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">
          <NuxtLink to="/fleet" class="link-btn">Armada</NuxtLink>
          <span class="muted"> · </span>{{ vehicle.merk }} {{ vehicle.model }}
        </h1>
        <p class="page-desc">{{ vehicle.plate }} · {{ vehicle.year }} · {{ vehicle.color }}</p>
      </div>
      <div class="row gap-8">
        <NuxtLink to="/fleet">
          <RButton variant="ghost" icon="arrow-left">Kembali</RButton>
        </NuxtLink>
      </div>
    </div>

    <div class="detail-grid">
      <!-- LEFT COLUMN -->
      <div class="stack-12">
        <RCard>
          <div class="detail-hero">
            <div class="detail-hero-img">
              <PhotoSlot :label="`Foto ${vehicle.model}`" />
            </div>
            <div>
              <h2 class="detail-title">{{ vehicle.merk }} {{ vehicle.model }} {{ vehicle.year }}</h2>
              <div class="row gap-8" style="margin-bottom: 10px;">
                <span class="plate lg">{{ vehicle.plate }}</span>
                <StatusBadge :status="vehicle.status" />
              </div>
              <p class="muted" style="margin: 0 0 16px; font-size: 13px;">
                <RIcon name="map-pin" :size="13" /> {{ branchName(vehicle.branch) }}
              </p>
              <div class="row gap-8" style="flex-wrap: wrap;">
                <RButton variant="primary" size="sm" icon="pencil">Edit</RButton>
                <RButton variant="default" size="sm" icon="wrench">Set Servis</RButton>
                <RButton variant="default" size="sm" icon="arrow-left-right">Pindah Cabang</RButton>
                <RButton variant="ghost" size="sm" icon="trash-2">Hapus</RButton>
              </div>
            </div>
          </div>
        </RCard>

        <RCard title="Harga Sewa">
          <ul class="price-list">
            <li><span class="muted">Harian</span><span class="num">{{ rupiah(vehicle.day) }}</span></li>
            <li><span class="muted">Mingguan</span><span class="num">{{ rupiah(vehicle.day * 6) }}</span></li>
            <li><span class="muted">Bulanan</span><span class="num">{{ rupiah(vehicle.day * 25) }}</span></li>
            <li><span class="muted">Dengan Sopir</span><span class="num accent">+{{ rupiah(150000) }}/hari</span></li>
          </ul>
        </RCard>

        <RCard title="Dokumen">
          <ul class="doc-list">
            <li class="doc-item">
              <RIcon name="file-text" :size="18" />
              <span class="doc-name">STNK <span class="muted">· berlaku s/d 20 Jun 2026</span></span>
              <a class="link-btn">Lihat</a>
            </li>
            <li class="doc-item">
              <RIcon name="file-text" :size="18" />
              <span class="doc-name">BPKB</span>
              <a class="link-btn">Lihat</a>
            </li>
            <li class="doc-item">
              <RIcon name="file-text" :size="18" />
              <span class="doc-name">Asuransi <span class="muted">· All Risk</span></span>
              <a class="link-btn">Lihat</a>
            </li>
          </ul>
        </RCard>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="stack-12">
        <RCard title="Riwayat Sewa" subtitle="3 terakhir" body-class="flush">
          <template #action><button class="link-btn">Lihat semua</button></template>
          <table class="tbl">
            <thead>
              <tr><th>Tanggal</th><th>Pelanggan</th><th>Durasi</th><th class="ta-right">Total</th></tr>
            </thead>
            <tbody>
              <tr v-for="h in history" :key="h.date">
                <td class="muted">{{ h.date }}</td>
                <td>
                  <div class="cell-cust">
                    <RAvatar :name="h.customer" :size="26" />
                    <span>{{ h.customer }}</span>
                  </div>
                </td>
                <td class="muted">{{ h.days }} hari</td>
                <td class="num ta-right">{{ rupiah(h.total) }}</td>
              </tr>
            </tbody>
          </table>
        </RCard>

        <RCard title="Jadwal Servis">
          <dl class="kv">
            <div v-for="m in maintenance" :key="m.label">
              <dt>{{ m.label }}</dt>
              <dd>{{ m.value }}</dd>
            </div>
            <div>
              <dt>Odometer</dt>
              <dd>{{ vehicle.odo.toLocaleString('id-ID') }} km</dd>
            </div>
          </dl>
          <RButton variant="default" size="sm" icon="plus" block>Tambah Jadwal</RButton>
        </RCard>
      </div>
    </div>
  </div>

  <div v-else class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Kendaraan tidak ditemukan</h1>
        <p class="page-desc">Unit dengan ID "{{ route.params.id }}" tidak ada.</p>
      </div>
    </div>
    <NuxtLink to="/fleet">
      <RButton variant="primary" icon="arrow-left">Kembali ke Armada</RButton>
    </NuxtLink>
  </div>
</template>
