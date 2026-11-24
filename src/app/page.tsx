import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check role and redirect
    const { data: userRole } = await supabase
      .from('user_roles')
      .select(`
        roles(name)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const role = (userRole as any)?.roles?.name
    if (role === 'admin') return redirect('/admin/dashboard')
    if (role === 'storekeeper') return redirect('/storekeeper/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <div className="max-w-md w-full mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-charcoal text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-charcoal">TOOLROOM</h1>
          <p className="text-sm text-brand-muted mt-1">Construction Tool Management System</p>
          <p className="text-xs text-brand-muted mt-0.5 italic">Every Tool Accounted For.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <LoginCard />
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-brand-muted">
            Authorized personnel only. All activity is logged.
          </p>
        </div>
      </div>
    </div>
  )
}

async function LoginCard() {
  async function login(formData: FormData) {
    'use server'

    const supabase = await createServerSupabaseClient()
    const email = String(formData.get('email') ?? '').trim().toLowerCase()
    const password = String(formData.get('password') ?? '')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) redirect('/?error=invalid_credentials')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/')

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const role = (userRole as any)?.roles?.name

    if (role === 'admin') redirect('/admin/dashboard')
    if (role === 'storekeeper') redirect('/storekeeper/dashboard')

    await supabase.auth.signOut()
    redirect('/?error=role_missing')
  }

  return (
    <form action={login} className="space-y-4">
      <div>
        <label className="form-label">Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="your@email.com"
          className="form-input"
        />
      </div>
      <div>
        <label className="form-label">Password</label>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          className="form-input"
        />
      </div>
      <button
        type="submit"
        className="w-full btn-primary py-2.5"
      >
        Sign In
      </button>
      <div className="text-center">
        <Link href="/forgot-password" className="text-xs text-brand-blue hover:underline">
          Forgot password?
        </Link>
      </div>
    </form>
  )
}
