<script setup lang="ts">
const props = withDefaults(
  defineProps<{ data: number[]; tone?: string; w?: number; h?: number }>(),
  { tone: 'primary', w: 96, h: 30 },
)

const geom = computed(() => {
  const { data, w, h } = props
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / span) * (h - 4) - 2
    return [x, y] as const
  })
  const d = pts
    .map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1))
    .join(' ')
  const area = `${d} L ${w} ${h} L 0 ${h} Z`
  return { d, area }
})

// tone is used as a CSS var name, e.g. "primary" -> var(--primary),
// "st-available" -> var(--st-available).
const stroke = computed(() => `var(--${props.tone})`)
const gid = computed(() => `sg-${props.tone}`)
</script>

<template>
  <svg
    :width="w"
    :height="h"
    class="spark"
    :viewBox="`0 0 ${w} ${h}`"
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient :id="gid" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" :stop-color="stroke" stop-opacity="0.22" />
        <stop offset="100%" :stop-color="stroke" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path :d="geom.area" :fill="`url(#${gid})`" />
    <path
      :d="geom.d"
      fill="none"
      :stroke="stroke"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
