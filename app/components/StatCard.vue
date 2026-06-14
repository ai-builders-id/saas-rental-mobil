<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon: string
  tone: 'available' | 'onrent' | 'maintenance' | 'primary'
  spark?: number[]
}>()
</script>

<template>
  <div class="stat">
    <div class="stat-top">
      <span class="stat-ico" :class="`tone-${tone}`">
        <RIcon :name="icon" :size="18" />
      </span>
      <Sparkline
        v-if="spark"
        :data="spark"
        :tone="tone === 'primary' ? 'primary' : `st-${tone}`"
      />
    </div>
    <div class="stat-num">{{ value }}</div>
    <div class="stat-meta">
      <span class="stat-label">{{ label }}</span>
      <slot name="sub" />
    </div>
  </div>
</template>
