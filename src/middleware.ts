import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          supabaseResponse = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verify the user and refresh their session when necessary.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isStorekeeperRoute = pathname.startsWith('/storekeeper')
  const isLoginPage = pathname === '/'

  function redirectWithCookies(destination: string) {
    const redirectResponse = NextResponse.redirect(
      new URL(destination, request.url)
    )

    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie)
    })

    return redirectResponse
  }

  // Protect both portals.
  if (!user) {
    if (isAdminRoute || isStorekeeperRoute) {
      return redirectWithCookies('/')
    }

    return supabaseResponse
  }

  // Only query roles when a portal or login page is requested.
  if (isLoginPage || isAdminRoute || isStorekeeperRoute) {
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('roles(name)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    const role = error ? null : (userRole as any)?.roles?.name

    if (isLoginPage) {
      if (role === 'admin') {
        return redirectWithCookies('/admin/dashboard')
      }

      if (role === 'storekeeper') {
        return redirectWithCookies('/storekeeper/dashboard')
      }
    }

    if (isAdminRoute && role !== 'admin') {
      return redirectWithCookies(
        role === 'storekeeper' ? '/storekeeper/dashboard' : '/'
      )
    }

    if (isStorekeeperRoute && role !== 'storekeeper') {
      return redirectWithCookies(
        role === 'admin' ? '/admin/dashboard' : '/'
      )
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
