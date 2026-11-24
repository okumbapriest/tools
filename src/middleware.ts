import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Allow public access to login and health checks
  if (pathname === '/' || pathname.startsWith('/_next') || pathname.startsWith('/api/health')) {
    return res
  }

  // Redirect logged-in users away from login page
  if (session && pathname === '/') {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single()

    const role = (userRole as any)?.roles?.name
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
    if (role === 'storekeeper') {
      return NextResponse.redirect(new URL('/storekeeper/dashboard', req.url))
    }
  }

  // Protect portal routes
  const isAdminRoute = pathname.startsWith('/admin')
  const isStorekeeperRoute = pathname.startsWith('/storekeeper')

  if (!session && (isAdminRoute || isStorekeeperRoute)) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (session) {
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single()

    const role = (userRole as any)?.roles?.name

    if (isAdminRoute && role !== 'admin') {
      return NextResponse.redirect(new URL('/storekeeper/dashboard', req.url))
    }
    if (isStorekeeperRoute && role !== 'storekeeper') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
