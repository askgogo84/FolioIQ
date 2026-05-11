import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Public routes — always accessible without login
  const publicRoutes = ['/', '/auth', '/upload']
  const isPublic = publicRoutes.some(r => path === r || path.startsWith('/auth'))

  // If logged in and trying to access auth page → go to dashboard
  if (path.startsWith('/auth') && path !== '/auth/callback' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Protected routes — must be logged in
  const protectedRoutes = ['/dashboard', '/intelligence', '/rebalance', '/tax-harvesting', '/chat', '/goals', '/calculator', '/backtest', '/screener', '/explore', '/transactions', '/profile', '/reports', '/capital-gains']
  const isProtected = protectedRoutes.some(r => path === r || path.startsWith(r))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
