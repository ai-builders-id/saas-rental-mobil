<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    pad?: boolean
    bodyClass?: string
  }>(),
  { pad: true, bodyClass: '' },
)
</script>

<template>
  <section class="card">
    <header v-if="title || $slots.action" class="card-head">
      <div class="card-head-text">
        <h3 v-if="title" class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-sub">{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </header>
    <div :class="[pad ? 'card-body' : '', bodyClass]">
      <slot />
    </div>
  </section>
</template>
