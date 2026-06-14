<script setup lang="ts">
// Thin wrapper over Nuxt UI's UIcon. Accepts a short Lucide name
// ("car-front") or a full Iconify name ("i-lucide-car-front").
const props = withDefaults(defineProps<{ name: string; size?: number }>(), {
  size: 18,
})

const iconName = computed(() =>
  props.name.startsWith('i-') ? props.name : `i-lucide-${props.name}`,
)
</script>

<template>
  <UIcon
    :name="iconName"
    class="icon"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>
