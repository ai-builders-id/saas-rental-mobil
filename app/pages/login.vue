<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const errMsg = ref('')

const supabase = useSupabaseClient()

// Akun demo untuk quick access
const demoAccounts = [
  { label: 'Admin', email: 'admin@rajawalirent.id', password: 'akucakep123', role: 'Owner' },
]

function fillDemo(acc: typeof demoAccounts[0]) {
  email.value = acc.email
  password.value = acc.password
}

async function onSubmit() {
  errMsg.value = ''
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    await navigateTo('/dashboard')
  } catch (e: any) {
    errMsg.value = e.message || 'Gagal masuk. Periksa email dan kata sandi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrap">
    <aside class="auth-aside">
      <div
        class="row gap-12 ai-center"
        style="color: #fff; font-weight: 800; font-size: 16px"
      >
        <span class="auth-aside-mark"><RIcon name="car-front" :size="22" /></span>
        <span>Rajawali Rentcar</span>
      </div>

      <div>
        <h2>Kelola seluruh armada rental Anda dalam satu dashboard.</h2>
        <p>Booking, GPS, pembayaran, dan laporan terhubung dalam satu sistem yang rapi.</p>
        <ul class="auth-feat">
          <li><RIcon name="check" :size="18" />Tracking armada real-time</li>
          <li><RIcon name="check" :size="18" />Booking via WhatsApp otomatis</li>
          <li><RIcon name="check" :size="18" />Laporan &amp; pembayaran terpadu</li>
        </ul>
      </div>

      <p style="font-size: 12px; opacity: 0.7; margin: 0">© 2026 Rajawali Rentcar</p>
    </aside>

    <main class="auth-main">
      <div class="auth-card">
        <h1>Masuk ke akun Anda</h1>
        <p class="sub">Selamat datang kembali. Silakan masuk untuk melanjutkan.</p>

        <!-- Akun Demo -->
        <div class="demo-section">
          <span class="demo-label">Demo Akun</span>
          <div class="demo-list">
            <button
              v-for="acc in demoAccounts"
              :key="acc.email"
              class="demo-btn"
              @click="fillDemo(acc)"
            >
              <span class="demo-btn-icon"><RIcon name="user" :size="14" /></span>
              <span class="demo-btn-text">
                <strong>{{ acc.label }}</strong>
                <span>{{ acc.role }} · {{ acc.email }}</span>
              </span>
              <RIcon name="arrow-right-to-line" :size="14" class="muted" />
            </button>
          </div>
        </div>

        <!-- Error alert -->
        <div v-if="errMsg" class="field" style="margin-bottom: 16px;">
          <div style="background: color-mix(in srgb, var(--st-maintenance) 12%, var(--bg-elev)); color: var(--st-maintenance); padding: 10px 14px; border-radius: var(--r-md); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <RIcon name="alert-circle" :size="16" />
            {{ errMsg }}
          </div>
        </div>

        <form @submit.prevent="onSubmit">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" v-model="email" type="email" placeholder="nama@bisnis.com" autocomplete="email" required />
          </div>

          <div class="field">
            <label for="password">Kata Sandi</label>
            <input id="password" v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" required />
          </div>

          <div class="row" style="justify-content: space-between; margin-bottom: 18px">
            <label style="display: flex; align-items: center; gap: 7px; font-size: 12.5px; font-weight: 600; cursor: pointer">
              <input v-model="remember" type="checkbox" />
              Ingat saya
            </label>
            <NuxtLink to="#" class="link-btn">Lupa sandi?</NuxtLink>
          </div>

          <RButton type="submit" variant="primary" block :loading="loading">Masuk</RButton>

          <div class="auth-sep">atau</div>

          <RButton type="button" variant="default" icon="chrome" block>Masuk dengan Google</RButton>
        </form>

        <p class="auth-alt">
          Belum punya akun? <NuxtLink to="/register">Daftar gratis</NuxtLink>
        </p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.demo-section {
  margin-bottom: 20px;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--primary-soft) 60%, transparent);
  border: 1px solid color-mix(in srgb, var(--primary) 15%, transparent);
  border-radius: var(--r-md);
}
.demo-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.demo-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.demo-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  text-align: left;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: border-color .15s, box-shadow .15s;
}
.demo-btn:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary) 20%, transparent);
}
.demo-btn-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-soft);
  border-radius: var(--r-sm);
  color: var(--primary);
  flex: 0 0 auto;
}
.demo-btn-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.demo-btn-text strong {
  font-size: 13px;
  font-weight: 600;
}
.demo-btn-text span:last-child {
  font-size: 11.5px;
  color: var(--text-muted);
}
</style>
