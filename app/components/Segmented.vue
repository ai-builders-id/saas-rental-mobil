<script setup lang="ts">
interface SegOption {
  value: string
  label?: string
  icon?: string
}

defineProps<{ options: SegOption[]; modelValue: string }>()
defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="seg">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      class="seg-item"
      :class="{ 'is-on': modelValue === o.value }"
      @click="$emit('update:modelValue', o.value)"
    >
      <RIcon v-if="o.icon" :name="o.icon" :size="15" />
      <span v-if="o.label">{{ o.label }}</span>
    </button>
  </div>
</template>
