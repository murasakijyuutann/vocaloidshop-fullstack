import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { calculateShipping, calculateDiscount, calculateTax, calculateOrderTotal } from '@/lib/pricing'

// Thrown when the authoritative in-transaction stock guard fails — lets
// callers distinguish "sold out mid-transaction" from any other error.
export class InsufficientStockError extends Error {
  constructor(productName: string) {
    super(`Insufficient stock for: ${productName}`)
  }
}

export interface CreateOrderFromCartParams {
  userId: number
  paymentIntentId?: string | null
  addressId?: number
  couponCode?: string
}

/**
 * Creates an order from the user's current cart, decrementing stock and
 * clearing the cart in a single transaction.
 *
 * Shared by the client-driven `POST /api/orders` route and the Stripe
 * webhook's safety-net path, so both go through the exact same stock/coupon
 * logic and the same atomic stock guard — there is only one place a race
 * condition on stock could be reintroduced.
 */
export async function createOrderFromCart({
  userId,
  paymentIntentId,
  addressId,
  couponCode,
}: CreateOrderFromCartParams) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  })

  if (cartItems.length === 0) {
    throw new Error('Cart is empty')
  }

  // Fast-fail stock check before touching the DB. This is a courtesy check
  // only — the authoritative guard against concurrent orders racing on the
  // same stock is the conditional decrement inside the transaction below.
  for (const item of cartItems) {
    if (item.product.stock < item.quantity) {
      throw new InsufficientStockError(item.product.name)
    }
  }

  let shipFields = {}
  if (addressId) {
    const address = await prisma.address.findUnique({ where: { id: addressId } })
    if (!address || address.userId !== userId) {
      throw new Error('Address not found')
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
  const shipping = calculateShipping(subtotal)

  // Apply coupon — always recomputed here rather than trusting a
  // previously-stored discount amount, so it reflects the coupon's current
  // validity/usage state at the moment the order is actually created.
  let discount = 0
  let appliedCoupon = null
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
    if (coupon) {
      discount = calculateDiscount(coupon, subtotal)
      if (discount > 0) appliedCoupon = coupon
    }
  }

  const tax = calculateTax(subtotal, discount)
  const totalAmount = calculateOrderTotal(subtotal, shipping, discount, tax)

  // Create order and decrement stock in a transaction. The decrement is
  // conditioned on `stock >= quantity` in the same atomic statement, so two
  // concurrent orders racing on the same product can't both succeed and
  // drive stock negative — whichever transaction commits second sees
  // `count === 0` and rolls back instead of overselling.
  return prisma.$transaction(async (tx) => {
    for (const item of cartItems) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      })
      if (updated.count === 0) {
        throw new InsufficientStockError(item.product.name)
      }
    }

    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        discountAmount: discount,
        taxAmount: tax,
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
}

/** True when `error` is a Prisma unique-constraint violation (e.g. two
 * concurrent order-creation attempts racing on the same PaymentIntent id). */
export function isUniqueConstraintViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}
