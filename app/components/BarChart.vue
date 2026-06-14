<script setup lang="ts">
interface BarDatum {
  day: number
  value: number
}

const props = withDefaults(
  defineProps<{ data: BarDatum[]; height?: number }>(),
  { height: 200 },
)

const hover = ref<number | null>(null)
const niceMax = computed(() => Math.ceil(Math.max(...props.data.map((d) => d.value))))
const gridLines = [1, 0.75, 0.5, 0.25, 0]
</script>

<template>
  <div class="barchart" :style="{ height: `${height}px` }">
    <div class="bc-grid">
      <div v-for="(f, i) in gridLines" :key="i" class="bc-line">
        <span class="bc-axis">{{ (niceMax * f).toFixed(1).replace('.0', '') }}</span>
      </div>
    </div>
    <div class="bc-bars">
      <div
        v-for="(d, i) in data"
        :key="i"
        class="bc-col"
        @mouseenter="hover = i"
        @mouseleave="hover = null"
      >
        <div v-if="hover === i" class="bc-tip">Rp {{ d.value.toFixed(1) }} jt</div>
        <div
          class="bc-bar"
          :class="{ 'is-hot': hover === i }"
          :style="{ height: `${(d.value / niceMax) * 100}%` }"
        />
        <span class="bc-label">{{ d.day }}</span>
      </div>
    </div>
  </div>
</template>
