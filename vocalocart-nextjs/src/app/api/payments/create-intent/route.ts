import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { calculateShipping, calculateDiscount, calculateOrderTotal } from '@/lib/pricing'
import { z } from 'zod'

const schema = z.object({
  addressId: z.number().int().positive().optional(),
  couponCode: z.string().optional(),
})

// Stripe metadata values must be strings and are capped at 500 chars —
// fine here since we only ever store small scalar identifiers, never the
// cart contents themselves.
function toMetadataString(value: string | number | undefined | null): string {
  return value === undefined || value === null ? '' : String(value)
}

// POST /api/payments/create-intent
// Creates a Stripe PaymentIntent for the current user's cart total.
// Returns { clientSecret, amount, discount } — the frontend uses
// clientSecret to mount Stripe Elements.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const userId = parseInt(session.user.id)
    const { addressId, couponCode } = parsed.data

    // Fetch cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    })
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = calculateShipping(subtotal)

    // Apply coupon
    let discount = 0
    let validatedCoupon = null
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (coupon) {
        discount = calculateDiscount(coupon, subtotal)
        if (discount > 0) validatedCoupon = coupon
      }
    }

    const total = calculateOrderTotal(subtotal, shipping, discount)

    // Deterministic idempotency key: same user + same cart contents + same
    // coupon + same total always hashes to the same key. A double-click, a
    // network retry, or a checkout page remount before payment all collapse
    // onto the same Stripe PaymentIntent instead of creating a new one each
    // time. Any real change to the cart/coupon/total naturally produces a
    // new key (and a fresh PaymentIntent with the correct amount).
    const idempotencyKey = createHash('sha256')
      .update(
        JSON.stringify({
          userId,
          items: cartItems
            .map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price }))
            .sort((a, b) => a.productId - b.productId),
          couponCode: validatedCoupon?.code ?? null,
          total,
        })
      )
      .digest('hex')

    // Create PaymentIntent (amount in smallest currency unit — yen = no decimals)
    // addressId is stashed in metadata (not used by this route) so the
    // webhook's safety-net order-creation path can attach shipping info if
    // it ever needs to create the order itself.
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: total,
        currency: 'jpy',
        metadata: {
          userId: toMetadataString(userId),
          addressId: toMetadataString(addressId),
          couponCode: validatedCoupon?.code ?? '',
          discount: discount.toString(),
        },
      },
      { idempotencyKey }
    )

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: total,
      discount,
      subtotal,
      shipping,
    })
  } catch (error) {
    console.error('create-intent error:', error)
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
