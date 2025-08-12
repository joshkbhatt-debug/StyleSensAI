import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Get the session from cookies
  const session = req.cookies.get('sb-access-token')?.value

  // Auth routes that should redirect if already authenticated
  const authRoutes = ['/login', '/signup']
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  if (isAuthRoute && session) {
    // Redirect to app if accessing auth routes with session
    return NextResponse.redirect(new URL('/app', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/login',
    '/signup',
  ],
} 