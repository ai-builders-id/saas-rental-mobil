<script setup lang="ts">
import type { FleetMixSlice } from '~/composables/useRentalData'

const props = withDefaults(
  defineProps<{ data: FleetMixSlice[]; size?: number; thickness?: number }>(),
  { size: 132, thickness: 16 },
)

const total = computed(() => props.data.reduce((a, b) => a + b.value, 0))
const r = computed(() => (props.size - props.thickness) / 2)
const c = computed(() => 2 * Math.PI * r.value)

const segments = computed(() => {
  let offset = 0
  return props.data.map((d) => {
    const len = (d.value / total.value) * c.value
    const seg = { tone: d.tone, len, dashArray: `${len} ${c.value - len}`, offset: -offset }
    offset += len
    return seg
  })
})
</script>

<template>
  <div class="donut-wrap">
    <svg :width="size" :height="size" class="donut">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="r"
        fill="none"
        stroke="var(--bg-subtle)"
        :stroke-width="thickness"
      />
      <circle
        v-for="(seg, i) in segments"
        :key="i"
        :cx="size / 2"
        :cy="size / 2"
        :r="r"
        fill="none"
        :stroke="`var(--st-${seg.tone})`"
        :stroke-width="thickness"
        :stroke-dasharray="seg.dashArray"
        :stroke-dashoffset="seg.offset"
        stroke-linecap="butt"
        :transform="`rotate(-90 ${size / 2} ${size / 2})`"
      />
    </svg>
    <div class="donut-center">
      <strong>{{ total }}</strong>
      <span>unit</span>
    </div>
  </div>
</template>
