'use client'
import { Suspense } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'

function CheckoutCompleteContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const [orderState, setOrderState] = useState<'loading' | 'success' | 'error'>('loading')
  const [orderId, setOrderId] = useState<number | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status !== 'authenticated') return
    if (ran.current) return
    ran.current = true

    const paymentIntentId = searchParams.get('payment_intent')
    const piStatus = searchParams.get('redirect_status')
    const addressId = searchParams.get('addressId')
    const couponCode = searchParams.get('couponCode') ?? undefined

    if (!paymentIntentId || piStatus !== 'succeeded') {
      setOrderState('error')
      return
    }

    // Finalize the order server-side
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
  }, [status, searchParams, router, clearCart])

  if (orderState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-5xl animate-spin">⏳</div>
        <p className="text-gray-600 text-lg font-medium">Confirming your payment…</p>
      </div>
    )
  }

  if (orderState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
        <div className="text-6xl">❌</div>
        <h1 className="text-2xl font-bold text-gray-800">Something went wrong</h1>
        <p className="text-gray-500">Your payment may have processed, but we could not confirm the order. Please contact support.</p>
        <button
          onClick={() => router.push('/orders')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-md transition-all"
        >
          View My Orders
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center page-enter">
      <div className="text-7xl">🎉</div>
      <h1 className="text-3xl font-bold text-gray-800">Order Confirmed!</h1>
      <p className="text-gray-500 text-lg">
        Thank you for your purchase. Order #{orderId} is being processed.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => router.push('/orders')}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-md transition-all"
        >
          View Orders
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-indigo-400 transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>}>
      <CheckoutCompleteContent />
    </Suspense>
  )
}
