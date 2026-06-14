<script setup lang="ts">
const route = useRoute()
const { tenant, init } = useRentalData()
onMounted(() => init())

const sections = [
  { icon: 'building-2', label: 'Profil Bisnis', desc: 'Nama perusahaan, alamat, kontak', active: true },
  { icon: 'message-circle', label: 'WhatsApp', desc: 'Nomor WA, template pesan, auto-reply' },
  { icon: 'users', label: 'Staff & Role', desc: 'Kelola akun staff dan hak akses' },
  { icon: 'credit-card', label: 'Langganan', desc: 'Paket, billing, upgrade' },
  { icon: 'palette', label: 'Tampilan', desc: 'Logo, warna, tema' },
  { icon: 'bell', label: 'Notifikasi', desc: 'Pengingat sewa, tagihan, servis' },
]
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Pengaturan</h1>
        <p class="page-desc">{{ tenant.name }} · Kelola pengaturan bisnis Anda</p>
      </div>
    </div>

    <div class="settings-grid">
      <button
        v-for="s in sections"
        :key="s.label"
        class="settings-card"
        :class="{ 'is-active': s.active }"
      >
        <span class="settings-ico">
          <RIcon :name="s.icon" :size="22" />
        </span>
        <div class="settings-body">
          <strong>{{ s.label }}</strong>
          <span class="muted">{{ s.desc }}</span>
        </div>
        <RIcon name="chevron-right" :size="16" class="muted" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 10px;
}
.settings-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--r-card);
  text-align: left;
  color: inherit;
  transition: border-color .15s, box-shadow .15s;
}
.settings-card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}
.settings-card.is-active {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary-soft);
}
.settings-ico {
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-subtle);
  border-radius: var(--r-md);
  color: var(--text);
  flex: 0 0 auto;
}
.settings-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.settings-body strong { font-size: 14px; font-weight: 600; }
.settings-body span { font-size: 12.5px; }
</style>
