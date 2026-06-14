<script setup lang="ts">
import { initials, avatarHue } from '~/utils/format'

const props = withDefaults(
  defineProps<{ name: string; size?: number; tone?: string }>(),
  { size: 32 },
)

const bg = computed(() => props.tone || avatarHue(props.name))
</script>

<template>
  <span
    class="avatar"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      background: bg,
      fontSize: `${size * 0.38}px`,
    }"
  >
    {{ initials(name) }}
  </span>
</template>
