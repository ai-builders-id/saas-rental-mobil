// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  modules: ['@nuxt/ui', '@nuxtjs/supabase'],

  // Nuxt 4 directory semantics (app/, shared/, server/)
  future: {
    compatibilityVersion: 4,
  },

  css: ['~/assets/css/main.css', 'leaflet/dist/leaflet.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Rajawali Rentcar — Dashboard',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
    storageKey: 'rr-theme',
  },

  supabase: {
    // url & key dibaca otomatis dari SUPABASE_URL / SUPABASE_KEY.
    // secretKey (service role) dibaca dari SUPABASE_SECRET_KEY — server only.

    // Auth dimatikan dari sisi redirect global: backend memproteksi per-route.
    // Frontend global middleware app/middleware/auth.global.ts yang guard.
    redirect: false,

    // Data diakses via Drizzle (server/db), bukan client Supabase, jadi
    // typing tabel tidak perlu ditarik ke client Supabase.
    types: false,
  },

  runtimeConfig: {
    // server-only
    supabaseDbUrl: process.env.SUPABASE_DB_URL,
    public: {
      appName: 'Rental Mobil SaaS',
    },
  },

  nitro: {
    // Default preset (node-server) untuk dev/lokal.
    // Untuk produksi Cloudflare, set preset 'cloudflare' (lihat techstack.md).
    experimental: {
      tasks: true,
    },
  },

  routeRules: {
    '/api/**': { cors: true },
  },

  typescript: {
    strict: true,
  },
})
