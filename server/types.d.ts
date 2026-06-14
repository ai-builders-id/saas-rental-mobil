import type { AuthContext } from '#shared/types/models'

declare module 'h3' {
  interface H3EventContext {
    /** Konteks auth (userId + tenantId + role) bila user sudah punya profil. */
    auth?: AuthContext
    /** Id auth.users bila user login (meski belum bootstrap profil). */
    authUserId?: string
  }
}

export {}
