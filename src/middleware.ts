import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  if (url.pathname === '/dashboard' || url.pathname === '/risk') {
    url.pathname = '/dashboard-v2'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
