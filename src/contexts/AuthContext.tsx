'use client'

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface User {
  id: string
  email: string
  full_name?: string | null
}

interface UserRole {
  roles: { name: string } | null
}

interface AuthState {
  user: User | null
  role: string | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null, loading: true })

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: roleRows } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
        const roleName = (roleRows as any)?.[0]?.roles?.name ?? null
        setState({
          user: { id: session.user.id, email: session.user.email!, full_name: session.user.user_metadata?.full_name },
          role: roleName,
          loading: false,
        })
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })

    // Listen for changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase.from('user_roles').select('roles(name)').eq('user_id', session.user.id).eq('status', 'active')
          .then(({ data: roleRows }) => {
            const roleName = (roleRows as any)?.[0]?.roles?.name ?? null
            setState({
              user: { id: session.user.id, email: session.user.email!, full_name: session.user.user_metadata?.full_name },
              role: roleName,
              loading: false,
            })
          })
      } else {
        setState({ user: null, role: null, loading: false })
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: roleRows } = await supabase
          .from('user_roles')
          .select('roles(name)')
          .eq('user_id', session.user.id)
          .eq('status', 'active')
        const roleName = (roleRows as any)?.[0]?.roles?.name ?? null
        setState({
          user: { id: session.user.id, email: session.user.email!, full_name: session.user.user_metadata?.full_name },
          role: roleName,
          loading: false,
        })
      }
    }
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setState({ user: null, role: null, loading: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
