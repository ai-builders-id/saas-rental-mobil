<script setup lang="ts">
defineProps<{ collapsed: boolean; title: string }>()
defineEmits<{ toggle: [] }>()

const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v) => (colorMode.preference = v ? 'dark' : 'light'),
})
</script>

<template>
  <header class="topbar">
    <div class="row gap-12 ai-center">
      <button class="icon-btn" title="Sembunyikan menu" @click="$emit('toggle')">
        <RIcon :name="collapsed ? 'panel-left-open' : 'panel-left-close'" :size="19" />
      </button>
      <nav class="crumbs">
        <span class="muted">Rajawali</span>
        <RIcon name="chevron-right" :size="14" class="muted" />
        <span class="crumb-current">{{ title }}</span>
      </nav>
    </div>

    <div class="topbar-search">
      <RIcon name="search" :size="16" class="muted" />
      <input placeholder="Cari plat, pelanggan, booking…" >
      <kbd>⌘K</kbd>
    </div>

    <div class="row gap-6 ai-center">
      <ClientOnly>
        <button class="icon-btn" title="Mode tampilan" @click="isDark = !isDark">
          <RIcon :name="isDark ? 'sun' : 'moon'" :size="18" />
        </button>
        <template #fallback>
          <span class="icon-btn" />
        </template>
      </ClientOnly>
      <button class="icon-btn has-dot" title="Notifikasi">
        <RIcon name="bell" :size="18" /><span class="ndot" />
      </button>
      <button class="icon-btn" title="Bantuan"><RIcon name="circle-help" :size="18" /></button>
      <button class="user-chip">
        <RAvatar name="Hendra Wijaya" :size="30" tone="#0284C7" />
        <div class="user-text">
          <strong>Pak Hendra</strong>
          <span>Owner</span>
        </div>
        <RIcon name="chevron-down" :size="15" class="muted" />
      </button>
    </div>
  </header>
</template>
