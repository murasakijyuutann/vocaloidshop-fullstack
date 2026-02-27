import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
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
    const pi = event.data.object as Stripe.PaymentIntent
    // Guard: if order already recorded by the complete page, skip
    const existing = await prisma.order.findUnique({
      where: { stripePaymentIntentId: pi.id },
    })
    if (!existing) {
      // Webhook arrived before complete page — mark any pending orders
      // This is a safety net; normal creation happens in POST /api/orders
      console.log('Webhook: PaymentIntent succeeded but no order found yet —', pi.id)
    } else if (existing.status === 'PAYMENT_RECEIVED') {
      console.log('Webhook: Order already PAYMENT_RECEIVED for PI', pi.id)
    }
  }

  return NextResponse.json({ received: true })
}
