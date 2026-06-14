<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const business = ref('')
const email = ref('')
const whatsapp = ref('')
const password = ref('')
const plan = ref('pro')
const loading = ref(false)
const errMsg = ref('')

const supabase = useSupabaseClient()

async function onSubmit() {
  errMsg.value = ''
  loading.value = true
  try {
    // 1. Sign up ke Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    if (!data.user) throw new Error('Gagal mendaftar. Silakan coba lagi.')

    // 2. Bootstrap tenant & profil via API
    try {
      await $fetch('/api/auth/bootstrap', {
        method: 'POST',
        body: {
          businessName: business.value,
          fullName: data.user.email?.split('@')[0] || 'Owner',
          phone: whatsapp.value || undefined,
          tier: plan.value.toLowerCase() as 'starter' | 'pro' | 'enterprise',
        },
      })
    } catch (bootstrapErr: any) {
      // Bootstrap gagal tapi user sudah terdaftar — arahkan login
      console.warn('Bootstrap warning:', bootstrapErr.message)
    }

    await navigateTo('/dashboard')
  } catch (e: any) {
    errMsg.value = e.message || 'Gagal mendaftar. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrap">
    <aside class="auth-aside">
      <div class="row gap-12 ai-center" style="color: #fff; font-weight: 800; font-size: 16px">
        <span class="auth-aside-mark"><RIcon name="car-front" :size="22" /></span>
        <span>Rajawali Rentcar</span>
      </div>

      <div>
        <h2>Mulai kelola bisnis rental Anda hari ini.</h2>
        <p>Coba gratis 14 hari. Aktifkan armada, staff, dan booking dalam hitungan menit.</p>
        <ul class="auth-feat">
          <li><RIcon name="check" :size="18" />Gratis 14 hari tanpa kartu kredit</li>
          <li><RIcon name="check" :size="18" />Setup armada &amp; cabang instan</li>
          <li><RIcon name="check" :size="18" />Booking WhatsApp otomatis sejak hari pertama</li>
        </ul>
      </div>

      <p style="font-size: 12px; opacity: 0.7; margin: 0">© 2026 Rajawali Rentcar</p>
    </aside>

    <main class="auth-main">
      <div class="auth-card">
        <h1>Buat akun bisnis</h1>
        <p class="sub">Coba gratis 14 hari. Tanpa kartu kredit.</p>

        <!-- Error alert -->
        <div v-if="errMsg" class="field" style="margin-bottom: 16px;">
          <div style="background: color-mix(in srgb, var(--st-maintenance) 12%, var(--bg-elev)); color: var(--st-maintenance); padding: 10px 14px; border-radius: var(--r-md); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <RIcon name="alert-circle" :size="16" />
            {{ errMsg }}
          </div>
        </div>

        <form @submit.prevent="onSubmit">
          <div class="field">
            <label for="business">Nama Bisnis</label>
            <input id="business" v-model="business" type="text" placeholder="Rajawali Rentcar" autocomplete="organization" required />
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" v-model="email" type="email" placeholder="nama@bisnis.com" autocomplete="email" required />
          </div>

          <div class="field">
            <label for="whatsapp">No. WhatsApp</label>
            <input id="whatsapp" v-model="whatsapp" type="tel" placeholder="0812 3456 7890" autocomplete="tel" />
          </div>

          <div class="field">
            <label for="password">Kata Sandi</label>
            <input id="password" v-model="password" type="password" placeholder="••••••••" minlength="6" autocomplete="new-password" required />
          </div>

          <div class="field">
            <label for="plan">Paket Langganan</label>
            <select id="plan" v-model="plan">
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <RButton type="submit" variant="primary" block :loading="loading">Daftar &amp; Mulai Trial</RButton>
        </form>

        <p class="auth-alt">
          Sudah punya akun? <NuxtLink to="/login">Masuk</NuxtLink>
        </p>
      </div>
    </main>
  </div>
</template>
