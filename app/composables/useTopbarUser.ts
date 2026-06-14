export interface TopbarUser {
  fullName: string
  displayName: string
  role: string
  email: string
  tone: string
}

const FALLBACK: TopbarUser = {
  fullName: 'Hendra Wijaya',
  displayName: 'Pak Hendra',
  role: 'Owner',
  email: 'admin@rajawalirent.id',
  tone: '#0284C7',
}

function shortName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return name
  return `Pak ${parts[parts.length - 1]}`
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  staff: 'Staff',
  manager: 'Manager',
}

export function useTopbarUser() {
  const user = ref<TopbarUser>({ ...FALLBACK })
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const data = await $fetch<{ profile: any; role: string }>('/api/me')
      const profile = data?.profile
      const fullName = profile?.full_name || profile?.name || FALLBACK.fullName
      const roleKey = (data?.role || 'owner').toLowerCase()
      user.value = {
        fullName,
        displayName: shortName(fullName),
        role: ROLE_LABEL[roleKey] || data?.role || FALLBACK.role,
        email: profile?.email || FALLBACK.email,
        tone: '#0284C7',
      }
    } catch {
      const { tenant } = useRentalData()
      user.value = {
        fullName: tenant.value.owner || FALLBACK.fullName,
        displayName: tenant.value.owner || FALLBACK.displayName,
        role: FALLBACK.role,
        email: FALLBACK.email,
        tone: '#0284C7',
      }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    const supabase = useSupabaseClient()
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  return { user, loading, load, logout }
}
