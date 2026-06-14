<script setup lang="ts">
import type { StatusTone } from '~/composables/useRentalData'

withDefaults(defineProps<{ tone?: StatusTone | 'neutral' }>(), {
  tone: 'neutral',
})
</script>

<template>
  <span class="badge" :class="`tone-${tone}`">
    <slot />
  </span>
</template>
