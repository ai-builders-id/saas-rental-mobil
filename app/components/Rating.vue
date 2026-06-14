<script setup lang="ts">
defineProps<{ value: number }>()
</script>

<template>
  <span class="rating">
    <RIcon name="star" :size="13" class="star-on" />
    <span class="rating-num">{{ value.toFixed(1) }}</span>
  </span>
</template>
