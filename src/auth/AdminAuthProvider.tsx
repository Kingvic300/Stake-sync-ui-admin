import { useMemo, useState, type ReactNode } from 'react'
import { AdminAuthContext, type AdminSession } from './context'

// Placeholder session until the admin auth endpoints exist. Sessions should be short-lived in production.
const KEY = 'stakesync.admin'

function load(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as AdminSession) : null
  } catch {
    return null
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(load)
  const value = useMemo(
    () => ({
      session,
      signIn: (s: AdminSession) => {
        try {
          sessionStorage.setItem(KEY, JSON.stringify(s))
        } catch {
          // this tab only
        }
        setSession(s)
      },
      signOut: () => {
        try {
          sessionStorage.removeItem(KEY)
        } catch {
          // nothing stored
        }
        setSession(null)
      },
    }),
    [session],
  )
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}
