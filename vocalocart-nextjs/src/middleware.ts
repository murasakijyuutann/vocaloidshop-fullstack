import { NextRequest, NextResponse } from 'next/server'

// Routes that require a session cookie (fast-fail before route handlers)
const protectedPrefixes = [
  '/api/cart',
  '/api/orders',
  '/api/addresses',
  '/api/wishlist',
  '/api/users/me',
  '/api/admin',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  // NextAuth v5 stores the session in one of these cookies
  const hasSession =
    request.cookies.has('__Secure-authjs.session-token') ||
    request.cookies.has('authjs.session-token')

  if (!hasSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
  // Note: full JWT verification + admin checks are done inside each route handler
  // via auth() from '@/lib/auth'. This middleware is a fast-fail for anonymous requests.
}

export const config = {
  matcher: ['/api/:path*'],
}

