import { describe, expect, it } from 'vitest'
import en from '../../messages/en.json'
import ja from '../../messages/ja.json'
import { isLocale, resolveLocale } from './config'

describe('resolveLocale', () => {
  it('defaults to en when no cookie value is present', () => {
    expect(resolveLocale(undefined)).toBe('en')
    expect(resolveLocale(null)).toBe('en')
  })

  it('accepts a supported locale as-is', () => {
    expect(resolveLocale('ja')).toBe('ja')
  })

  it('falls back to en for an unsupported value', () => {
    expect(resolveLocale('fr')).toBe('en')
  })
})

describe('isLocale', () => {
  it('recognizes en and ja', () => {
    expect(isLocale('en')).toBe(true)
    expect(isLocale('ja')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isLocale('fr')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })
})

describe('message scaffolds', () => {
  it('proves a string round-trips from en.json through the demo key', () => {
    expect(en.Nav.home).toBe('Home')
  })

  it('proves the ja.json counterpart is wired up too', () => {
    expect(ja.Nav.home).toBe('ホーム')
  })
})
