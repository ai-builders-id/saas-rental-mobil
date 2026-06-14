<script setup lang="ts">
import type { FleetStatusId } from '~/composables/useRentalData'

const props = withDefaults(
  defineProps<{ status: FleetStatusId; dot?: boolean }>(),
  { dot: true },
)

const { STATUS } = useRentalData()
const meta = computed(
  () => STATUS[props.status] ?? { label: props.status, tone: 'inspection' },
)
</script>

<template>
  <span class="badge" :class="`tone-${meta.tone}`">
    <span v-if="dot" class="badge-dot" />
    {{ meta.label }}
  </span>
</template>
