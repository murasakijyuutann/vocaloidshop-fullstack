import { describe, expect, it } from 'vitest'
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_COST,
  calculateShipping,
  isCouponApplicable,
  calculateDiscount,
  calculateOrderTotal,
  type CouponLike,
} from './pricing'

function makeCoupon(overrides: Partial<CouponLike> = {}): CouponLike {
  return {
    type: 'PERCENTAGE',
    value: 10,
    minOrderAmount: null,
    maxUses: null,
    usedCount: 0,
    expiresAt: null,
    active: true,
    ...overrides,
  }
}

describe('calculateShipping', () => {
  it('charges the standard fee below the free-shipping threshold', () => {
    expect(calculateShipping(0)).toBe(STANDARD_SHIPPING_COST)
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD - 1)).toBe(STANDARD_SHIPPING_COST)
  })

  it('is free at and above the threshold', () => {
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD)).toBe(0)
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD + 1000)).toBe(0)
  })
})

describe('isCouponApplicable', () => {
  it('rejects an inactive coupon', () => {
    expect(isCouponApplicable(makeCoupon({ active: false }), 10000)).toBe(false)
  })

  it('rejects an expired coupon', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const coupon = makeCoupon({ expiresAt: new Date('2025-12-31T00:00:00Z') })
    expect(isCouponApplicable(coupon, 10000, now)).toBe(false)
  })

  it('accepts a coupon that expires in the future', () => {
    const now = new Date('2026-01-01T00:00:00Z')
    const coupon = makeCoupon({ expiresAt: new Date('2026-06-01T00:00:00Z') })
    expect(isCouponApplicable(coupon, 10000, now)).toBe(true)
  })

  it('rejects a coupon that has hit its max uses', () => {
    const coupon = makeCoupon({ maxUses: 5, usedCount: 5 })
    expect(isCouponApplicable(coupon, 10000)).toBe(false)
  })

  it('accepts a coupon that has not yet hit its max uses', () => {
    const coupon = makeCoupon({ maxUses: 5, usedCount: 4 })
    expect(isCouponApplicable(coupon, 10000)).toBe(true)
  })

  it('rejects an order below the coupon minimum', () => {
    const coupon = makeCoupon({ minOrderAmount: 5000 })
    expect(isCouponApplicable(coupon, 4999)).toBe(false)
  })

  it('accepts an order at exactly the coupon minimum', () => {
    const coupon = makeCoupon({ minOrderAmount: 5000 })
    expect(isCouponApplicable(coupon, 5000)).toBe(true)
  })
})

describe('calculateDiscount', () => {
  it('returns 0 for a coupon that is not applicable', () => {
    const coupon = makeCoupon({ active: false })
    expect(calculateDiscount(coupon, 10000)).toBe(0)
  })

  it('computes a percentage discount, rounded down', () => {
    const coupon = makeCoupon({ type: 'PERCENTAGE', value: 15 })
    // 15% of 9999 = 1499.85 -> floors to 1499
    expect(calculateDiscount(coupon, 9999)).toBe(1499)
  })

  it('computes a fixed discount', () => {
    const coupon = makeCoupon({ type: 'FIXED', value: 300 })
    expect(calculateDiscount(coupon, 10000)).toBe(300)
  })

  it('caps a fixed discount at the subtotal so total cannot go negative', () => {
    const coupon = makeCoupon({ type: 'FIXED', value: 5000 })
    expect(calculateDiscount(coupon, 1000)).toBe(1000)
  })
})

describe('calculateOrderTotal', () => {
  it('adds shipping and subtracts discount from the subtotal', () => {
    expect(calculateOrderTotal(10000, 500, 1000)).toBe(9500)
  })

  it('never returns a negative total', () => {
    expect(calculateOrderTotal(1000, 500, 5000)).toBe(0)
  })

  it('returns exactly 0 rather than a negative edge value', () => {
    expect(calculateOrderTotal(1000, 0, 1000)).toBe(0)
  })
})
