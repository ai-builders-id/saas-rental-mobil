<script setup lang="ts">
import type { CustomerStatus } from '~/composables/useRentalData'

const route = useRoute()
const { customers } = useRentalData()

const id = computed(() => String(route.params.id))
const customer = computed(() => customers.value.find((c) => c.id === id.value))

const email = computed(() =>
  customer.value
    ? `${customer.value.name.toLowerCase().replace(/\s+/g, '.')}@email.com`
    : '',
)

function statusBadge(s: CustomerStatus) {
  if (s === 'blacklist') return { tone: 'maintenance' as const, label: 'Blacklist' }
  if (s === 'verified') return { tone: 'available' as const, label: 'Terverifikasi' }
  return { tone: 'booked' as const, label: 'Aktif' }
}

// Fabricated rental history (demo data).
const history = [
  { date: '10 Jun 2026', vehicle: 'Mitsubishi Xpander', duration: '3 hari', total: 'Rp 1.350.000' },
  { date: '05 Jun 2026', vehicle: 'Honda Brio', duration: '1 hari', total: 'Rp 350.000' },
  { date: '28 Mei 2026', vehicle: 'Toyota Hiace', duration: '7 hari', total: 'Rp 2.100.000' },
]
</script>

<template>
  <div class="page">
    <template v-if="customer">
      <div class="page-head">
        <div>
          <NuxtLink to="/customers" class="link-btn">← Pelanggan</NuxtLink>
          <h1 class="page-title">{{ customer.name }}</h1>
        </div>
        <div class="row gap-8">
          <RButton variant="default" icon="pencil">Edit</RButton>
          <RButton variant="ghost" icon="user-x">Blacklist</RButton>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Profile -->
        <RCard>
          <div class="detail-hero">
            <RAvatar :name="customer.name" :size="64" />
            <div>
              <h2 class="detail-title">{{ customer.name }}</h2>
              <dl class="kv">
                <div>
                  <dt><RIcon name="phone" :size="14" /> Telepon</dt>
                  <dd class="num">{{ customer.phone }}</dd>
                </div>
                <div>
                  <dt><RIcon name="mail" :size="14" /> Email</dt>
                  <dd>{{ email }}</dd>
                </div>
                <div>
                  <dt><RIcon name="map-pin" :size="14" /> Kota</dt>
                  <dd>{{ customer.city }}</dd>
                </div>
                <div>
                  <dt><RIcon name="star" :size="14" /> Rating</dt>
                  <dd>
                    <Rating :value="customer.rating" />
                    <span class="muted"> ({{ customer.rentals }} sewa)</span>
                  </dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <RBadge :tone="statusBadge(customer.status).tone">
                      {{ statusBadge(customer.status).label }}
                    </RBadge>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </RCard>

        <!-- Documents -->
        <RCard title="Dokumen">
          <ul class="doc-list">
            <li class="doc-item">
              <RIcon name="file-text" :size="18" class="icon" />
              <span class="veh-name">KTP</span>
              <div class="spacer" />
              <a class="link-btn" href="#">Lihat</a>
            </li>
            <li class="doc-item">
              <RIcon name="file-text" :size="18" class="icon" />
              <span class="veh-name">SIM</span>
              <div class="spacer" />
              <a class="link-btn" href="#">Lihat</a>
            </li>
          </ul>
        </RCard>

        <!-- Active Rental (only when active) -->
        <RCard v-if="customer.status === 'active'" title="Sewa Aktif">
          <div class="row gap-12" style="margin-bottom: 12px">
            <span class="plate">B 5678 ABC</span>
            <span class="veh-name">Honda Brio</span>
          </div>
          <dl class="kv">
            <div><dt>Ambil</dt><dd>14 Jun 2026 · 09:00</dd></div>
            <div><dt>Kembali</dt><dd>15 Jun 2026 · 18:00</dd></div>
            <div><dt>Status</dt><dd><StatusBadge status="ON_RENT" /></dd></div>
          </dl>
          <a class="link-btn" href="#">Lihat Detail →</a>
        </RCard>

        <!-- Rental History (full width) -->
        <RCard title="Riwayat Sewa" :pad="false" style="grid-column: 1 / -1">
          <table class="tbl">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kendaraan</th>
                <th>Durasi</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="h in history" :key="h.date">
                <td class="muted">{{ h.date }}</td>
                <td class="veh-name">{{ h.vehicle }}</td>
                <td class="muted">{{ h.duration }}</td>
                <td class="num">{{ h.total }}</td>
                <td><RBadge tone="available">Selesai</RBadge></td>
              </tr>
            </tbody>
          </table>
        </RCard>
      </div>
    </template>

    <div v-else class="empty">
      <span class="empty-ico"><RIcon name="user-x" :size="26" /></span>
      <h2>Pelanggan tidak ditemukan</h2>
      <p>Data pelanggan dengan ID ini tidak tersedia.</p>
      <NuxtLink to="/customers" class="link-btn">← Kembali ke daftar pelanggan</NuxtLink>
    </div>
  </div>
</template>
