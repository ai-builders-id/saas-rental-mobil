<script setup lang="ts">
import type { SearchResult } from '~/composables/useGlobalSearch'

const { open, query, results, closeSearch, goTo } = useGlobalSearch()

const inputRef = ref<HTMLInputElement | null>(null)
const activeIdx = ref(0)

watch(open, async (v) => {
  if (!v) {
    activeIdx.value = 0
    return
  }
  await nextTick()
  inputRef.value?.focus()
  activeIdx.value = 0
})

watch(query, () => {
  activeIdx.value = 0
})

watch(results, () => {
  if (activeIdx.value >= results.value.length) activeIdx.value = 0
})

function onKeydown(e: KeyboardEvent) {
  if (!open.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIdx.value = Math.min(activeIdx.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIdx.value = Math.max(activeIdx.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const hit = results.value[activeIdx.value]
    if (hit) goTo(hit)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    closeSearch()
  }
}

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  fleet: 'Armada',
  customer: 'Pelanggan',
  booking: 'Booking',
  page: 'Halaman',
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="search-overlay" @click.self="closeSearch">
      <div class="search-palette" role="dialog" aria-label="Pencarian global">
        <div class="search-palette-head">
          <RIcon name="search" :size="18" class="muted" />
          <input
            ref="inputRef"
            v-model="query"
            type="search"
            placeholder="Cari plat, pelanggan, booking, halaman…"
            autocomplete="off"
          >
          <kbd>Esc</kbd>
        </div>

        <ul v-if="results.length" class="search-results">
          <li
            v-for="(r, i) in results"
            :key="r.id"
            class="search-hit"
            :class="{ 'is-active': i === activeIdx }"
            @mouseenter="activeIdx = i"
            @click="goTo(r)"
          >
            <span class="search-hit-ico"><RIcon :name="r.icon" :size="16" /></span>
            <div class="search-hit-body">
              <strong>{{ r.title }}</strong>
              <span>{{ r.subtitle }}</span>
            </div>
            <span class="search-hit-tag">{{ TYPE_LABEL[r.type] }}</span>
          </li>
        </ul>

        <div v-else class="search-empty">
          <p>Tidak ada hasil untuk <strong>{{ query }}</strong></p>
          <span class="muted">Coba plat nomor, nama pelanggan, atau nama halaman</span>
        </div>

        <div class="search-foot muted">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigasi</span>
          <span><kbd>Enter</kbd> buka</span>
          <span><kbd>Esc</kbd> tutup</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
