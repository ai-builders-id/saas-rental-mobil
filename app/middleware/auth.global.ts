// Global middleware — redirect ke /login bila user tidak terautentikasi.
// Halaman login & register dikecualikan dari guard.
const AUTH_PAGES = ['/login', '/register', '/']

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip guard untuk halaman publik/auth
  if (AUTH_PAGES.includes(to.path)) return

  try {
    const supabase = useSupabaseClient()
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      return navigateTo('/login')
    }
  } catch {
    // Jika getSession gagal (mis. client offline), redirect login
    return navigateTo('/login')
  }
})
