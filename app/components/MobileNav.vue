<script setup lang="ts">
const items = [
  { to: '/dashboard', label: 'Home', icon: 'layout-dashboard' },
  { to: '/fleet', label: 'Armada', icon: 'car-front' },
  { to: '/bookings', label: 'Booking', icon: 'calendar-days' },
  { to: '/customers', label: 'Pelanggan', icon: 'users' },
]
</script>

<template>
  <nav class="mobile-nav">
    <NuxtLink
      v-for="i in items"
      :key="i.to"
      :to="i.to"
      active-class="is-active"
    >
      <RIcon :name="i.icon" :size="20" />
      <span>{{ i.label }}</span>
    </NuxtLink>
  </nav>
</template>
