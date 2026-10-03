import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Keep Auth.js, bcrypt, JWT cookies, and the admin route real. Only database I/O
// and Next's request-scoped headers are supplied by the test.
const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  headers: vi.fn(),
}))
vi.mock('./prisma', () => ({
  prisma: { user: { findUnique: mocks.findUnique }, order: { findMany: mocks.findMany } },
}))
vi.mock('next/headers', () => ({ headers: mocks.headers, cookies: vi.fn() }))

const origin = 'http://localhost:3000'
const password = 'correct-test-password'
const user = {
  id: 1, email: 'admin@example.com', name: 'Test user',
  password: bcrypt.hashSync(password, 4), isAdmin: true,
}
let handlers: typeof import('./auth')['handlers']
let adminOrders: typeof import('../app/api/admin/orders/route')['GET']
let jar: Map<string, string>

beforeAll(async () => {
  vi.stubEnv('NEXTAUTH_SECRET', 'test-only-secret-for-login-regression')
  vi.stubEnv('AUTH_SECRET', 'test-only-secret-for-login-regression')
  vi.stubEnv('NEXTAUTH_URL', origin)
  vi.stubEnv('AUTH_URL', origin)
  vi.stubEnv('AUTH_TRUST_HOST', 'true')
  ;({ handlers } = await import('./auth'))
  ;({ GET: adminOrders } = await import('../app/api/admin/orders/route'))
})
afterAll(() => vi.unstubAllEnvs())
beforeEach(() => {
  vi.clearAllMocks()
  jar = new Map()
  mocks.findUnique.mockResolvedValue(user)
  mocks.findMany.mockResolvedValue([])
  mocks.headers.mockImplementation(async () => new Headers({
    host: 'localhost:3000', 'x-forwarded-proto': 'http', cookie: cookieHeader(),
  }))
})

function cookieHeader() {
  return [...jar].map(([name, value]) => `${name}=${value}`).join('; ')
}

function acceptCookies(response: Response) {
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';')[0]
    const separator = pair.indexOf('=')
    const name = pair.slice(0, separator)
    const value = pair.slice(separator + 1)
    if (value) jar.set(name, value)
    else jar.delete(name)
  }
}

function sessionCookies() {
  // Include secure and chunked JWT cookie names.
  return [...jar.keys()].filter(name => /^(?:__Secure-)?authjs\.session-token(?:\.\d+)?$/.test(name))
}

async function signInWithCredentials(email: string, submittedPassword: string) {
  const csrfResponse = await handlers.GET(new NextRequest(`${origin}/api/auth/csrf`))
  expect(csrfResponse.status).toBe(200)
  acceptCookies(csrfResponse)
  const { csrfToken } = await csrfResponse.json()
  const response = await handlers.POST(new NextRequest(`${origin}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      cookie: cookieHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Auth-Return-Redirect': '1',
    },
    body: new URLSearchParams({ email, password: submittedPassword, csrfToken, callbackUrl: origin }),
  }))
  acceptCookies(response)
  return response
}

async function session() {
  const response = await handlers.GET(new NextRequest(`${origin}/api/auth/session`, {
    headers: { cookie: cookieHeader() },
  }))
  expect(response.status).toBe(200)
  return response.json()
}

describe('credentials session and admin boundary', () => {
  it.each(['wrong password', 'unknown email'])('%s creates no session and cannot read admin orders', async failure => {
    if (failure === 'unknown email') mocks.findUnique.mockResolvedValue(null)
    const email = failure === 'unknown email' ? 'missing@example.com' : user.email
    const response = await signInWithCredentials(email, 'wrong-password')

    expect(mocks.findUnique).toHaveBeenCalledExactlyOnceWith({ where: { email } })
    // This is the actual HTTP-200 failure that the old res?.ok branch mistook
    // for success; do not mock Auth.js or simply assume the session is null.
    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
    const { url } = await response.json()
    expect(new URL(url).searchParams.get('error')).toBe('CredentialsSignin')
    expect(sessionCookies()).toEqual([])
    expect(await session()).toBeNull()

    const denied = await adminOrders()
    expect(denied.status).toBe(403)
    expect(await denied.json()).toEqual({ error: 'Unauthorized' })
    expect(mocks.findMany).not.toHaveBeenCalled()
  })

  it('rejects a valid non-admin session', async () => {
    mocks.findUnique.mockResolvedValue({ ...user, isAdmin: false })
    await signInWithCredentials(user.email, password)
    expect(sessionCookies()).toHaveLength(1)
    expect((await session()).user.isAdmin).toBe(false)

    const denied = await adminOrders()
    expect(denied.status).toBe(403)
    expect(mocks.findMany).not.toHaveBeenCalled()
  })

  it('allows a valid admin session as a positive control', async () => {
    await signInWithCredentials(user.email, password)
    expect(sessionCookies()).toHaveLength(1)
    const authenticated = await session()
    expect(authenticated.user).toMatchObject({ id: '1', email: user.email, isAdmin: true })

    const allowed = await adminOrders()
    expect(allowed.status).toBe(200)
    expect(await allowed.json()).toEqual({ orders: [] })
    expect(mocks.findMany).toHaveBeenCalledOnce()
  })
})
