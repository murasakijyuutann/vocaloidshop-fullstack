import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { createOrderFromCart, InsufficientStockError, isUniqueConstraintViolation } from '@/lib/create-order-from-cart'

const placeOrderSchema = z.object({
  addressId: z.number().int().positive().optional(),
  paymentIntentId: z.string().optional(),
  couponCode: z.string().optional(),
})

// GET /api/orders — current user's orders
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        orderItems: { include: { product: true } },
      },
      orderBy: { orderedAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders — place order from current cart
export async function POST(request: NextRequest) {
  // Hoisted so the catch block can use it too (e.g. to resolve a race with
  // the webhook's safety-net order creation for the same PaymentIntent).
  let paymentIntentId: string | undefined

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = placeOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const userId = parseInt(session.user.id)
    const { addressId, couponCode } = parsed.data
    paymentIntentId = parsed.data.paymentIntentId

    // If a PaymentIntent ID is provided, verify it was actually paid with Stripe
    if (paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (pi.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment has not been completed' },
          { status: 402 }
        )
      }
      // Guard against replay: ensure this PI hasn't already created an order.
      // (It may have been created by the Stripe webhook's safety-net path if
      // that fired before this request reached us.)
      const duplicate = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { orderItems: { include: { product: true } } },
      })
      if (duplicate) {
        return NextResponse.json(duplicate, { status: 200 })
      }
    }

    const order = await createOrderFromCart({ userId, paymentIntentId, addressId, couponCode })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    if (isUniqueConstraintViolation(error) && paymentIntentId) {
      // Lost a race with a concurrent order-creation attempt for the same
      // PaymentIntent (e.g. the webhook's safety net won first) — return
      // whichever order won instead of surfacing a 500 to the client.
      const existing = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
        include: { orderItems: { include: { product: true } } },
      })
      if (existing) {
        return NextResponse.json(existing, { status: 200 })
      }
    }
    console.error('place order error:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
