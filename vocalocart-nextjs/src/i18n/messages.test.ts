import { describe, expect, it } from 'vitest'
import en from '../../messages/en.json'
import ja from '../../messages/ja.json'

// Recursively flattens a messages object into dotted key paths, e.g.
// { Nav: { home: 'Home' } } -> ['Nav.home']. A forgotten translation would
// otherwise silently render the raw key (e.g. "Nav.home") in production
// instead of failing CI — this is the cheapest, highest-value i18n test.
function collectKeyPaths(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return [prefix]
  }
  return Object.entries(value).flatMap(([key, child]) =>
    collectKeyPaths(child, prefix ? `${prefix}.${key}` : key)
  )
}

describe('message key parity (en.json vs ja.json)', () => {
  const enKeys = collectKeyPaths(en).sort()
  const jaKeys = collectKeyPaths(ja).sort()

  it('has no keys present in en.json but missing from ja.json', () => {
    const missing = enKeys.filter(key => !jaKeys.includes(key))
    expect(missing).toEqual([])
  })

  it('has no keys present in ja.json but missing from en.json', () => {
    const missing = jaKeys.filter(key => !enKeys.includes(key))
    expect(missing).toEqual([])
  })

  it('has a non-trivial number of keys in both locales (sanity check)', () => {
    expect(enKeys.length).toBeGreaterThan(100)
    expect(jaKeys.length).toBe(enKeys.length)
  })
})
