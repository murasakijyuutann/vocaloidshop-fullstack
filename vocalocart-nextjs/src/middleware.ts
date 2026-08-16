import { NextRequest, NextResponse } from 'next/server'
import { isRateLimited } from '@/lib/rate-limit'

// Routes that require a session cookie (fast-fail before route handlers)
const protectedPrefixes = [
  '/api/cart',
  '/api/orders',
  '/api/addresses',
  '/api/wishlist',
  '/api/users/me',
  '/api/admin',
]

// Rate-limited route groups, checked in order. Deliberately narrow (exact
// path + method) rather than whole-prefix bans, so read-only NextAuth calls
// like /api/auth/session (fired on every page load by useSession) never get
// caught in a limiter meant for login/registration brute force.
interface RateLimitRule {
  label: string
  limit: number
  windowMs: number
  matches: (pathname: string, method: string) => boolean
}

const RATE_LIMIT_RULES: RateLimitRule[] = [
  {
    label: 'auth',
    limit: 10,
    windowMs: 60_000,
    matches: (p, m) =>
      m === 'POST' && (p === '/api/auth/register' || p === '/api/auth/callback/credentials'),
  },
  {
    label: 'checkout',
    limit: 20,
    windowMs: 60_000,
    matches: (p, m) =>
      m === 'POST' && (p === '/api/payments/create-intent' || p === '/api/orders'),
  },
  {
    label: 'search',
    limit: 60,
    windowMs: 60_000,
    matches: (p, m) => m === 'GET' && p === '/api/products',
  },
]

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  const rule = RATE_LIMIT_RULES.find(r => r.matches(pathname, method))
  if (rule) {
    const ip = getClientIp(request)
    if (isRateLimited(`${rule.label}:${ip}`, rule.limit, rule.windowMs)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      )
    }
  }

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

