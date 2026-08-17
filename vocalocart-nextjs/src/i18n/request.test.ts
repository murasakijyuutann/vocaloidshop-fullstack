import { describe, expect, it, vi } from 'vitest'
import en from '../../messages/en.json'
import ja from '../../messages/ja.json'
import requestConfig from './request'

// `next/headers`'s `cookies()` only works inside a real Next.js request
// scope, so it's mocked here to drive `request.ts`'s locale resolution
// end-to-end without a running server (vi.mock calls are hoisted above
// imports by Vitest, so this applies before `requestConfig` is loaded).
const getMock = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: getMock }),
}))

// `next-intl/server`'s module resolution picks a build that guards against
// Client Component usage when the "react-server" export condition isn't
// active (which Vitest doesn't set). At runtime `getRequestConfig` is just
// `(fn) => fn` — see next-intl's own react-server build — so mocking it as
// the identity function is faithful to production behavior, not a shortcut.
vi.mock('next-intl/server', () => ({
  getRequestConfig: (fn: unknown) => fn,
}))

function mockCookie(value: string | undefined) {
  getMock.mockImplementation((name: string) =>
    name === 'locale' && value !== undefined ? { value } : undefined
  )
}

describe('i18n request config — locale cookie round-trip', () => {
  it('resolves to ja and loads ja.json when the locale cookie is "ja"', async () => {
    mockCookie('ja')
    const config = await requestConfig({ requestLocale: Promise.resolve(undefined) })
    expect(config.locale).toBe('ja')
    expect(config.messages).toEqual(ja)
  })

  it('resolves to en and loads en.json when the locale cookie is "en"', async () => {
    mockCookie('en')
    const config = await requestConfig({ requestLocale: Promise.resolve(undefined) })
    expect(config.locale).toBe('en')
    expect(config.messages).toEqual(en)
  })

  it('defaults to en when no locale cookie is present', async () => {
    mockCookie(undefined)
    const config = await requestConfig({ requestLocale: Promise.resolve(undefined) })
    expect(config.locale).toBe('en')
    expect(config.messages).toEqual(en)
  })

  it('falls back to en for a stale/unsupported cookie value', async () => {
    mockCookie('fr')
    const config = await requestConfig({ requestLocale: Promise.resolve(undefined) })
    expect(config.locale).toBe('en')
    expect(config.messages).toEqual(en)
  })
})
