<script setup lang="ts">
import type { AlertItem } from '~/composables/useRentalData'

defineProps<{ collapsed: boolean; title: string }>()
defineEmits<{ toggle: [] }>()

const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (v) => (colorMode.preference = v ? 'dark' : 'light'),
})

const { openSearch } = useGlobalSearch()
const { user, load, logout } = useTopbarUser()
const { alerts, init, fetched } = useRentalData()

const notifOpen = ref(false)
const helpOpen = ref(false)
const userOpen = ref(false)

const notifWrap = ref<HTMLElement | null>(null)
const helpWrap = ref<HTMLElement | null>(null)
const userWrap = ref<HTMLElement | null>(null)

onMounted(() => {
  load()
  if (!fetched.value) init()
  window.addEventListener('keydown', onGlobalKeydown)
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  document.removeEventListener('click', onDocClick)
})

function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    openSearch()
  }
}

function onDocClick(e: MouseEvent) {
  const t = e.target as Node
  if (notifWrap.value && !notifWrap.value.contains(t)) notifOpen.value = false
  if (helpWrap.value && !helpWrap.value.contains(t)) helpOpen.value = false
  if (userWrap.value && !userWrap.value.contains(t)) userOpen.value = false
}

function closeMenus() {
  notifOpen.value = false
  helpOpen.value = false
  userOpen.value = false
}

function toggleNotif() {
  const next = !notifOpen.value
  closeMenus()
  notifOpen.value = next
}

function toggleHelp() {
  const next = !helpOpen.value
  closeMenus()
  helpOpen.value = next
}

function toggleUser() {
  const next = !userOpen.value
  closeMenus()
  userOpen.value = next
}

function focusSearch() {
  openSearch()
}

const unreadCount = computed(() => alerts.value.length)

const HELP_LINKS = [
  { icon: 'keyboard', label: 'Pintasan keyboard', desc: '⌘K / Ctrl+K untuk pencarian', action: 'search' as const },
  { icon: 'settings', label: 'Pengaturan', desc: 'Profil bisnis & langganan', href: '/settings' },
  { icon: 'message-circle', label: 'WhatsApp Support', desc: 'Hubungi tim Rajawali', href: 'https://wa.me/6281234567890' },
  { icon: 'book-open', label: 'Panduan operasional', desc: 'Tips kelola armada & booking', href: '/dashboard' },
]

function runHelp(item: typeof HELP_LINKS[number]) {
  helpOpen.value = false
  if ('action' in item && item.action === 'search') {
    openSearch()
    return
  }
  if (item.href?.startsWith('http')) {
    window.open(item.href, '_blank', 'noopener')
    return
  }
  if (item.href) navigateTo(item.href)
}

function alertRoute(a: AlertItem): string {
  const t = a.title.toLowerCase()
  if (t.includes('sewa') || t.includes('booking') || t.includes('dp')) return '/bookings'
  if (t.includes('stnk') || t.includes('servis') || t.includes('maintenance')) return '/fleet'
  if (t.includes('whatsapp')) return '/bookings'
  return '/dashboard'
}

function openAlert(a: AlertItem) {
  notifOpen.value = false
  navigateTo(alertRoute(a))
}

const SEV_CLASS: Record<AlertItem['sev'], string> = {
  error: 'tone-error',
  warning: 'tone-warning',
  info: 'tone-info',
}
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

    <div class="topbar-search" @click="focusSearch">
      <RIcon name="search" :size="16" class="muted" />
      <input
        readonly
        placeholder="Cari plat, pelanggan, booking…"
        @focus="openSearch"
        @click="openSearch"
      >
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

      <div ref="notifWrap" class="topbar-drop-wrap">
        <button
          class="icon-btn"
          :class="{ 'has-dot': unreadCount > 0 }"
          title="Notifikasi"
          @click.stop="toggleNotif"
        >
          <RIcon name="bell" :size="18" />
          <span v-if="unreadCount > 0" class="ndot" />
        </button>

        <div v-if="notifOpen" class="topbar-drop is-wide">
          <div class="topbar-drop-head">
            <strong>Notifikasi</strong>
            <span v-if="unreadCount" class="topbar-drop-badge">{{ unreadCount }} baru</span>
          </div>

          <ul v-if="alerts.length" class="topbar-drop-list">
            <li
              v-for="a in alerts"
              :key="a.id"
              class="topbar-drop-item"
              @click="openAlert(a)"
            >
              <span class="topbar-drop-ico" :class="SEV_CLASS[a.sev]">
                <RIcon :name="a.icon" :size="16" />
              </span>
              <div class="topbar-drop-body">
                <strong>{{ a.title }}</strong>
                <span>{{ a.desc }}</span>
                <small class="muted">{{ a.time }}</small>
              </div>
            </li>
          </ul>

          <div v-else class="topbar-drop-empty">
            <RIcon name="bell-off" :size="22" class="muted" />
            <p>Semua beres — tidak ada notifikasi baru</p>
          </div>

          <div class="topbar-drop-foot">
            <button class="link-btn" @click="notifOpen = false; navigateTo('/dashboard')">
              Lihat semua di Dashboard
            </button>
          </div>
        </div>
      </div>

      <div ref="helpWrap" class="topbar-drop-wrap">
        <button class="icon-btn" title="Bantuan" @click.stop="toggleHelp">
          <RIcon name="circle-help" :size="18" />
        </button>

        <div v-if="helpOpen" class="topbar-drop">
          <div class="topbar-drop-head"><strong>Bantuan</strong></div>
          <ul class="topbar-drop-list">
            <li
              v-for="h in HELP_LINKS"
              :key="h.label"
              class="topbar-drop-item"
              @click="runHelp(h)"
            >
              <span class="topbar-drop-ico tone-info">
                <RIcon :name="h.icon" :size="16" />
              </span>
              <div class="topbar-drop-body">
                <strong>{{ h.label }}</strong>
                <span>{{ h.desc }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div ref="userWrap" class="topbar-drop-wrap">
        <button class="user-chip" @click.stop="toggleUser">
          <RAvatar :name="user.fullName" :size="30" :tone="user.tone" />
          <div class="user-text">
            <strong>{{ user.displayName }}</strong>
            <span>{{ user.role }}</span>
          </div>
          <RIcon name="chevron-down" :size="15" class="muted" />
        </button>

        <div v-if="userOpen" class="topbar-drop">
          <div class="topbar-drop-user">
            <RAvatar :name="user.fullName" :size="36" :tone="user.tone" />
            <div>
              <strong>{{ user.fullName }}</strong>
              <span class="muted">{{ user.email }}</span>
            </div>
          </div>

          <ul class="topbar-drop-menu">
            <li>
              <button @click="userOpen = false; navigateTo('/settings')">
                <RIcon name="settings" :size="16" />
                Pengaturan
              </button>
            </li>
            <li>
              <button @click="userOpen = false; navigateTo('/dashboard')">
                <RIcon name="layout-dashboard" :size="16" />
                Dashboard
              </button>
            </li>
            <li class="is-sep" />
            <li>
              <button class="is-danger" @click="logout">
                <RIcon name="log-out" :size="16" />
                Keluar
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>
