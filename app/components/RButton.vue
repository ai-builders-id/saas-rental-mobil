<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'ghost'
    size?: 'sm' | 'md'
    icon?: string
    iconRight?: string
    block?: boolean
    title?: string
    type?: 'button' | 'submit'
  }>(),
  { variant: 'default', size: 'md', type: 'button' },
)
</script>

<template>
  <button
    :type="type"
    class="btn"
    :class="[`btn-${variant}`, `btn-${size}`, { 'btn-block': block }]"
    :title="title"
  >
    <RIcon v-if="icon" :name="icon" :size="size === 'sm' ? 15 : 16" />
    <span v-if="$slots.default"><slot /></span>
    <RIcon v-if="iconRight" :name="iconRight" :size="size === 'sm' ? 15 : 16" />
  </button>
</template>
