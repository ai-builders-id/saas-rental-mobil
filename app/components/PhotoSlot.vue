<script setup lang="ts">
// Image placeholder that mirrors the prototype's <image-slot> element:
// a neutral panel with an icon, label and "browse files" affordance.
withDefaults(
  defineProps<{ label?: string; icon?: string }>(),
  { icon: 'image' },
)
</script>

<template>
  <div class="photo-slot">
    <RIcon :name="icon" :size="22" />
    <span class="photo-slot-label">{{ label }}</span>
    <span class="photo-slot-sub">or <a>browse files</a></span>
  </div>
</template>
