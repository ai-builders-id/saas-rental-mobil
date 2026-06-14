<script setup lang="ts">
import type { CustomerStatus } from '~/composables/useRentalData'

const { customers, loading, init } = useRentalData()

onMounted(() => init())

const q = ref('')

const rows = computed(() => {
  const list = customers.value
  if (!Array.isArray(list)) return []
  return list.filter(
    (c) =>
      !q.value ||
      c.name.toLowerCase().includes(q.value.toLowerCase()) ||
      c.phone.includes(q.value),
  )
})

function statusBadge(s: CustomerStatus) {
  if (s === 'blacklist') return { tone: 'maintenance' as const, label: 'Blacklist' }
  if (s === 'verified') return { tone: 'available' as const, label: 'Terverifikasi' }
  return { tone: 'booked' as const, label: 'Aktif' }
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Pelanggan</h1>
        <p class="page-desc">
          <template v-if="loading">Memuat...</template>
          <template v-else>{{ Array.isArray(customers) ? customers.length : 0 }} pelanggan terdaftar</template>
        </p>
      </div>
      <RButton variant="primary" icon="user-plus">Tambah Pelanggan</RButton>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="empty">
      <div class="empty-ico"><RIcon name="loader-circle" :size="28" /></div>
      <h2>Memuat data pelanggan...</h2>
    </div>

    <!-- Empty state -->
    <div v-else-if="!Array.isArray(customers) || customers.length === 0" class="empty">
      <div class="empty-ico"><RIcon name="users" :size="28" /></div>
      <h2>Belum ada pelanggan</h2>
      <p>Pelanggan akan muncul setelah melakukan transaksi sewa pertama.</p>
      <RButton variant="primary" icon="user-plus">Tambah Pelanggan</RButton>
    </div>

    <template v-else>
      <div class="toolbar">
        <div class="search">
          <RIcon name="search" :size="16" />
          <input v-model="q" placeholder="Cari nama atau nomor HP…">
        </div>
        <select class="select">
          <option>Semua status</option>
          <option>Aktif</option>
          <option>Blacklist</option>
        </select>
        <div class="spacer" />
        <RButton variant="ghost" icon="download" size="sm">Ekspor</RButton>
      </div>

      <RCard :pad="false">
        <table class="tbl tbl-lg">
          <thead>
            <tr>
              <th>Pelanggan</th>
              <th>Kontak</th>
              <th>Kota</th>
              <th>Rating</th>
              <th>Total Sewa</th>
              <th>Status</th>
              <th>Terakhir</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in rows"
              :key="c.id"
              style="cursor: pointer"
              @click="navigateTo(`/customers/${c.id}`)"
            >
              <td>
                <div class="cell-cust">
                  <RAvatar :name="c.name" :size="32" />
                  <span class="veh-name">{{ c.name }}</span>
                </div>
              </td>
              <td class="num muted">{{ c.phone }}</td>
              <td class="muted">{{ c.city }}</td>
              <td><Rating :value="c.rating" /></td>
              <td class="num">{{ c.rentals }}×</td>
              <td>
                <RBadge :tone="statusBadge(c.status).tone">{{ statusBadge(c.status).label }}</RBadge>
              </td>
              <td class="muted">{{ c.lastRent }}</td>
              <td class="ta-right">
                <button class="icon-btn"><RIcon name="chevron-right" :size="16" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </RCard>
    </template>
  </div>
</template>
