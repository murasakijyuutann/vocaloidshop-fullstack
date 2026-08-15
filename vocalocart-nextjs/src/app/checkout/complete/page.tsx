'use client'
import { Suspense } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function CheckoutCompleteContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()

  const paymentIntentId = searchParams.get('payment_intent')
  const piStatus = searchParams.get('redirect_status')
  const addressId = searchParams.get('addressId')
  const couponCode = searchParams.get('couponCode') ?? undefined
  const hasValidPaymentIntent = !!paymentIntentId && piStatus === 'succeeded'

  // The validity of the redirect params is known synchronously from the URL,
  // so it's encoded directly in the initial state instead of being set from
  // inside the effect below (which only needs to run the async order-confirm
  // request once we know we actually have something to confirm).
  const [orderState, setOrderState] = useState<'loading' | 'success' | 'error'>(
    hasValidPaymentIntent ? 'loading' : 'error'
  )
  const [orderId, setOrderId] = useState<number | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status !== 'authenticated') return
    if (!hasValidPaymentIntent) return
    if (ran.current) return
    ran.current = true

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        addressId: addressId ? parseInt(addressId) : undefined,
        couponCode,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          clearCart()
          setOrderId(data.id)
          setOrderState('success')
        } else {
          setOrderState('error')
          toast.error(data.error ?? 'Failed to confirm order')
        }
      })
      .catch(() => setOrderState('error'))
  }, [status, hasValidPaymentIntent, paymentIntentId, addressId, couponCode, router, clearCart])

  if (orderState === 'loading') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
        <p className="text-lg font-medium text-foreground">Confirming your payment…</p>
      </div>
    )
  }

  if (orderState === 'error') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-surface">
          <XCircle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your payment may have processed, but we could not confirm the order. Please contact support.
        </p>
        <Button onClick={() => router.push('/orders')}>View my orders</Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center page-enter">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface">
        <CheckCircle2 className="h-8 w-8 text-foreground" strokeWidth={1.5} />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Order confirmed</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Thank you for your purchase. Order #{orderId} is being processed.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => router.push('/orders')}>View orders</Button>
        <Button variant="outline" onClick={() => router.push('/')}>Continue shopping</Button>
      </div>
    </div>
  )
}

export default function CheckoutCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
        </div>
      }
    >
      <CheckoutCompleteContent />
    </Suspense>
  )
}
