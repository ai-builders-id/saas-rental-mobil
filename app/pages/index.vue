<script setup lang="ts">
// Landing entry → send straight to the dashboard for this demo.
// (Swap for a marketing landing page or auth gate when wiring backend.)
definePageMeta({
  layout: false,
  middleware: () => navigateTo('/dashboard'),
})
</script>

<template>
  <div />
</template>
