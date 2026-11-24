import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Get the current user's role.
 * Returns 'admin' or 'storekeeper' or null if not authenticated.
 */
export async function getCurrentRole() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', user.id)
    .single()

  return (data as any)?.roles?.name ?? null
}

/**
 * Check if the current user has a specific role.
 */
export async function hasRole(role: string): Promise<boolean> {
  const currentUserRole = await getCurrentRole()
  return currentUserRole === role
}

/**
 * Redirect based on role after login.
 */
export async function getPortalRedirect(role: string | null) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'storekeeper') return '/storekeeper/dashboard'
  return '/'
}
