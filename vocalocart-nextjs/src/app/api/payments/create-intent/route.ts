import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({
  addressId: z.number().int().positive().optional(),
  couponCode: z.string().optional(),
})

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
    const { couponCode } = parsed.data

    // Fetch cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    })
    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= 5000 ? 0 : 500

    // Apply coupon
    let discount = 0
    let validatedCoupon = null
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (coupon && coupon.active) {
        const now = new Date()
        const expired = coupon.expiresAt && coupon.expiresAt < now
        const maxed = coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses
        const underMin = coupon.minOrderAmount !== null && subtotal < coupon.minOrderAmount
        if (!expired && !maxed && !underMin) {
          discount = coupon.type === 'PERCENTAGE'
            ? Math.floor(subtotal * (coupon.value / 100))
            : Math.min(coupon.value, subtotal)
          validatedCoupon = coupon
        }
      }
    }

    const total = Math.max(0, subtotal + shipping - discount)

    // Create PaymentIntent (amount in smallest currency unit — yen = no decimals)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'jpy',
      metadata: {
        userId: userId.toString(),
        couponCode: validatedCoupon?.code ?? '',
        discount: discount.toString(),
      },
    })

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
