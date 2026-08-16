// Pure pricing/cart math shared by the order-creation transaction, the
// Stripe PaymentIntent creation route, and their tests. Kept dependency-free
// (no Prisma types, no I/O) so it can be unit tested without a database.

export const FREE_SHIPPING_THRESHOLD = 5000
export const STANDARD_SHIPPING_COST = 500

/** Flat shipping rule: free at/above the threshold, a flat fee below it. */
export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST
}

/** 消費税 (Japan consumption tax) rate. */
export const TAX_RATE = 0.1

/**
 * 消費税 on the item subtotal net of any discount (not shipping — shipping
 * is charged separately and isn't part of the taxable goods price here).
 * Rounded down to the nearest yen, matching how yen amounts have no
 * subdivision to round to in the first place.
 */
export function calculateTax(subtotal: number, discount: number): number {
  const taxableBase = Math.max(0, subtotal - discount)
  return Math.floor(taxableBase * TAX_RATE)
}

export interface CouponLike {
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  active: boolean
}

/** Whether `coupon` can currently be applied to an order of `subtotal`. */
export function isCouponApplicable(coupon: CouponLike, subtotal: number, now: Date = new Date()): boolean {
  if (!coupon.active) return false
  if (coupon.expiresAt && coupon.expiresAt <= now) return false
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return false
  if (coupon.minOrderAmount !== null && subtotal < coupon.minOrderAmount) return false
  return true
}

/**
 * Discount amount for `coupon` against `subtotal` — 0 if the coupon isn't
 * currently applicable. Always capped at `subtotal` so a FIXED coupon can
 * never push the order total negative on its own.
 */
export function calculateDiscount(coupon: CouponLike, subtotal: number, now: Date = new Date()): number {
  if (!isCouponApplicable(coupon, subtotal, now)) return 0
  const raw = coupon.type === 'PERCENTAGE'
    ? Math.floor(subtotal * (coupon.value / 100))
    : coupon.value
  return Math.min(raw, subtotal)
}

/** Final order total — clamped at 0 so shipping/discount can't go negative. */
export function calculateOrderTotal(subtotal: number, shipping: number, discount: number, tax: number): number {
  return Math.max(0, subtotal + shipping - discount + tax)
}
