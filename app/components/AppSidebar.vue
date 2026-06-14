<script setup lang="ts">
defineProps<{ collapsed: boolean }>()

const { summary, tenant } = useRentalData()

const bookingsBadge = computed(() => summary.value.bookingsToday)

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { to: '/fleet', label: 'Armada', icon: 'car-front' },
  { to: '/bookings', label: 'Booking', icon: 'calendar-days', badge: bookingsBadge },
  { to: '/customers', label: 'Pelanggan', icon: 'users' },
  { to: '/gps', label: 'GPS Tracking', icon: 'map-pin' },
  { to: '/reports', label: 'Laporan', icon: 'chart-column' },
]
const navSystem = [{ to: '/settings', label: 'Pengaturan', icon: 'settings' }]
</script>

<template>
  <aside class="sidebar" :class="{ 'is-collapsed': collapsed }">
    <div class="brand">
      <span class="brand-mark"><RIcon name="car-front" :size="20" /></span>
      <div v-if="!collapsed" class="brand-text">
        <strong>Rajawali</strong>
        <span>Rentcar</span>
      </div>
    </div>

    <button class="branch-pick" title="Cabang aktif">
      <span class="branch-ico"><RIcon name="git-branch" :size="16" /></span>
      <template v-if="!collapsed">
        <span class="branch-name">Semua Cabang</span>
        <RIcon name="chevrons-up-down" :size="15" class="muted" />
      </template>
    </button>

    <nav class="nav">
      <p v-if="!collapsed" class="nav-section">Menu</p>
      <NuxtLink
        v-for="n in nav"
        :key="n.to"
        :to="n.to"
        class="nav-item"
        active-class="is-active"
        :title="collapsed ? n.label : ''"
      >
        <RIcon :name="n.icon" :size="19" />
        <span v-if="!collapsed" class="nav-label">{{ n.label }}</span>
        <span v-if="!collapsed && n.badge != null" class="nav-badge">{{ n.badge }}</span>
      </NuxtLink>

      <div class="nav-gap" />
      <p v-if="!collapsed" class="nav-section">Sistem</p>
      <NuxtLink
        v-for="n in navSystem"
        :key="n.to"
        :to="n.to"
        class="nav-item"
        active-class="is-active"
        :title="collapsed ? n.label : ''"
      >
        <RIcon :name="n.icon" :size="19" />
        <span v-if="!collapsed" class="nav-label">{{ n.label }}</span>
      </NuxtLink>
    </nav>

    <div class="side-foot">
      <div class="plan-card">
        <template v-if="!collapsed">
          <div class="plan-row">
            <span class="plan-badge">PRO</span>
            <span class="plan-trial">Trial · 9 hari</span>
          </div>
          <div class="plan-bar"><div :style="{ width: '64%' }" /></div>
          <p class="plan-usage">37 / 50 unit terpakai</p>
          <button class="upgrade-btn"><RIcon name="zap" :size="14" />Upgrade</button>
        </template>
        <span v-else class="plan-badge">PRO</span>
      </div>
    </div>
  </aside>
</template>
