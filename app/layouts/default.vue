<script setup lang="ts">
const collapsed = ref(false)
const route = useRoute()

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  fleet: 'Armada',
  bookings: 'Booking',
  customers: 'Pelanggan',
  gps: 'GPS Tracking',
  reports: 'Laporan',
  settings: 'Pengaturan',
}

const title = computed(() => {
  const seg = route.path.split('/').filter(Boolean)[0] ?? 'dashboard'
  return TITLES[seg] ?? 'Dashboard'
})
</script>

<template>
  <div class="shell">
    <AppSidebar :collapsed="collapsed" />
    <div class="main">
      <AppTopbar :collapsed="collapsed" :title="title" @toggle="collapsed = !collapsed" />
      <main class="scroll">
        <slot />
      </main>
    </div>
    <MobileNav />
    <GlobalSearch />
  </div>
</template>
