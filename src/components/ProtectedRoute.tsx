'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppProvider'

export function ProtectedRoute({ children, allowedRoles }: {
  children: React.ReactNode
  allowedRoles: string[]
}) {
  const { user, role, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/')
      return
    }
    if (!allowedRoles.includes(role ?? '')) {
      router.replace(role === 'admin' ? '/admin/dashboard' : '/storekeeper/dashboard')
    }
  }, [user, role, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted">Loading TOOLROOM…</p>
        </div>
      </div>
    )
  }

  if (!user || !allowedRoles.includes(role ?? '')) return null
  return <>{children}</>
}
