import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createOrderFromCart, InsufficientStockError, isUniqueConstraintViolation } from '@/lib/create-order-from-cart'
import Stripe from 'stripe'

// POST /api/payments/webhook
// Stripe sends events here. Set STRIPE_WEBHOOK_SECRET in your env.
// CLI: stripe listen --forward-to localhost:3000/api/payments/webhook
export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
  }

  // Always 200 once the event has been handled (or safely no-op'd) so Stripe
  // doesn't keep retrying — the only case we intentionally reject is an
  // invalid signature above.
  return NextResponse.json({ received: true })
}

/**
 * Safety net for order creation. In the normal path, the client creates the
 * order itself right after `stripe.confirmPayment` redirects back to
 * /checkout/complete. This handler only needs to act when that never
 * happens — e.g. the browser was closed before the redirect completed.
 *
 * This is what makes the handler idempotent/replay-safe: Stripe may deliver
 * the same event more than once, but `stripePaymentIntentId` is a unique
 * column, so every delivery after the first either finds the order already
 * there (no-op) or loses a create-order race to whichever request got there
 * first (also a no-op, via the unique-constraint catch below).
 */
async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent) {
  const existing = await prisma.order.findUnique({
    where: { stripePaymentIntentId: pi.id },
  })
  if (existing) {
    console.log('Webhook: order already exists for PaymentIntent', pi.id)
    return
  }

  const userId = parseInt(pi.metadata.userId ?? '', 10)
  if (!Number.isFinite(userId)) {
    console.error('Webhook: PaymentIntent succeeded with no userId in metadata —', pi.id)
    return
  }

  const addressIdRaw = pi.metadata.addressId
  const addressId = addressIdRaw ? parseInt(addressIdRaw, 10) : undefined
  const couponCode = pi.metadata.couponCode || undefined

  try {
    const order = await createOrderFromCart({
      userId,
      paymentIntentId: pi.id,
      addressId: Number.isFinite(addressId) ? addressId : undefined,
      couponCode,
    })
    console.log('Webhook: created order', order.id, 'as safety net for PaymentIntent', pi.id)
  } catch (error) {
    if (isUniqueConstraintViolation(error)) {
      // The client's own POST /api/orders won the race and created the
      // order first — nothing left to do.
      console.log('Webhook: order already created concurrently for PaymentIntent', pi.id)
      return
    }
    if (error instanceof InsufficientStockError) {
      // Payment already succeeded but stock ran out before this safety net
      // could run. No automatic remedy here (no refund/notification wiring
      // yet) — logged loudly so it surfaces in monitoring for manual review.
      console.error('Webhook: paid order could not be fulfilled —', pi.id, error.message)
      return
    }
    // Cart empty, address missing, etc. — nothing more this safety net can
    // do automatically; log for visibility rather than throwing (a 5xx here
    // would just make Stripe retry the same unrecoverable event forever).
    console.error('Webhook: failed to create safety-net order for PaymentIntent', pi.id, error)
  }
}
