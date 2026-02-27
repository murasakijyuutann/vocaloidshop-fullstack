import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'

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
    const { addressId, paymentIntentId, couponCode } = parsed.data

    // If a PaymentIntent ID is provided, verify it was actually paid with Stripe
    if (paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (pi.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment has not been completed' },
          { status: 402 }
        )
      }
      // Guard against replay: ensure this PI hasn't already created an order
      const duplicate = await prisma.order.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
      })
      if (duplicate) {
        return NextResponse.json(duplicate, { status: 200 })
      }
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Validate stock for every item before touching the DB
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for: ${item.product.name}` },
          { status: 409 }
        )
      }
    }

    let shipFields = {}
    if (addressId) {
      const address = await prisma.address.findUnique({ where: { id: addressId } })
      if (!address || address.userId !== userId) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 })
      }
      shipFields = {
        shipRecipientName: address.recipientName,
        shipLine1: address.line1,
        shipLine2: address.line2,
        shipCity: address.city,
        shipState: address.state,
        shipPostalCode: address.postalCode,
        shipCountry: address.country,
        shipPhone: address.phone,
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal >= 5000 ? 0 : 500

    // Apply coupon
    let discount = 0
    let appliedCoupon = null
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (coupon && coupon.active) {
        const now = new Date()
        const valid =
          (!coupon.expiresAt || coupon.expiresAt > now) &&
          (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
          (coupon.minOrderAmount === null || subtotal >= coupon.minOrderAmount)
        if (valid) {
          discount = coupon.type === 'PERCENTAGE'
            ? Math.floor(subtotal * (coupon.value / 100))
            : Math.min(coupon.value, subtotal)
          appliedCoupon = coupon
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + shipping - discount)

    // Create order and decrement stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount,
          discountAmount: discount,
          couponCode: appliedCoupon?.code ?? null,
          stripePaymentIntentId: paymentIntentId ?? null,
          ...shipFields,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { orderItems: { include: { product: true } } },
      })

      // Increment coupon usage
      if (appliedCoupon) {
        await tx.coupon.update({
          where: { id: appliedCoupon.id },
          data: { usedCount: { increment: 1 } },
        })
      }

      await tx.cartItem.deleteMany({ where: { userId } })

      return newOrder
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('place order error:', error)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
