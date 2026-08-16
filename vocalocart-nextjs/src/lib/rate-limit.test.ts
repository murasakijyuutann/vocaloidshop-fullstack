import { describe, expect, it, vi, afterEach } from 'vitest'
import { isRateLimited } from './rate-limit'

describe('isRateLimited', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests up to the limit', () => {
    const key = `test-allow-${Math.random()}`
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(key, 5, 60_000)).toBe(false)
    }
  })

  it('blocks requests once the limit is exceeded within the window', () => {
    const key = `test-block-${Math.random()}`
    for (let i = 0; i < 5; i++) {
      isRateLimited(key, 5, 60_000)
    }
    expect(isRateLimited(key, 5, 60_000)).toBe(true)
  })

  it('resets after the window elapses', () => {
    vi.useFakeTimers()
    const key = `test-reset-${Math.random()}`
    for (let i = 0; i < 5; i++) {
      isRateLimited(key, 5, 1000)
    }
    expect(isRateLimited(key, 5, 1000)).toBe(true)

    vi.advanceTimersByTime(1001)
    expect(isRateLimited(key, 5, 1000)).toBe(false)
  })

  it('tracks separate keys independently', () => {
    const keyA = `test-independent-a-${Math.random()}`
    const keyB = `test-independent-b-${Math.random()}`
    for (let i = 0; i < 5; i++) {
      isRateLimited(keyA, 5, 60_000)
    }
    expect(isRateLimited(keyA, 5, 60_000)).toBe(true)
    expect(isRateLimited(keyB, 5, 60_000)).toBe(false)
  })
})
