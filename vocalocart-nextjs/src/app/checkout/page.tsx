'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Address {
  id: number
  recipientName: string
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

// ── Inner form rendered inside <Elements> ──────────────────────────────────
function StripePaymentForm({
  addressId,
  couponCode,
  onBack,
}: {
  addressId: number | null
  couponCode: string
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)

    const params = new URLSearchParams()
    if (addressId) params.set('addressId', String(addressId))
    if (couponCode) params.set('couponCode', couponCode)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/complete?${params}`,
      },
    })

    if (error) {
      toast.error(error.message ?? 'Payment failed')
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <PaymentElement options={{ layout: 'tabs' }} />
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={paying}
          className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-indigo-400 transition-all disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={!stripe || paying}
          className="flex-[2] py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {paying ? '⏳ Processing…' : '🔒 Pay Now'}
        </button>
      </div>
    </form>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, totalPrice, totalItems, fetchCart } = useCart()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  const [couponInput, setCouponInput] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [creatingIntent, setCreatingIntent] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetchCart()
      fetch('/api/addresses')
        .then(r => r.json())
        .then(d => {
          setAddresses(d.addresses ?? [])
          const def = d.addresses?.find((a: Address) => a.isDefault)
          if (def) setSelectedAddressId(def.id)
        })
    }
  }, [status, router, fetchCart])

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>
  }

  const subtotal = totalPrice()
  const shipping = subtotal >= 5000 ? 0 : 500
  const total = Math.max(0, subtotal + shipping - discount)

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setValidatingCoupon(true)
    setCouponMsg('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderAmount: subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        setCouponCode(code)
        setDiscount(data.discount)
        setCouponMsg(`✅ Coupon applied! You save ¥${data.discount.toLocaleString()}`)
        toast.success(`Coupon applied — ¥${data.discount.toLocaleString()} off`)
      } else {
        setCouponCode('')
        setDiscount(0)
        setCouponMsg(`❌ ${data.error}`)
      }
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponInput('')
    setDiscount(0)
    setCouponMsg('')
    setClientSecret(null)
  }

  const handleProceedToPayment = async () => {
    if (items.length === 0) { toast.error('Your cart is empty'); return }
    setCreatingIntent(true)
    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: selectedAddressId ?? undefined,
          couponCode: couponCode || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        toast.error(data.error ?? 'Could not start payment')
      }
    } finally {
      setCreatingIntent(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">🚀 Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left column */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Shipping Address</h2>
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No saved addresses. Please add one first.</p>
                <button onClick={() => router.push('/addresses')} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-md transition-all">
                  + Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                    <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => { setSelectedAddressId(addr.id); setClientSecret(null) }} className="mt-1 accent-indigo-600" />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800">{addr.recipientName}</p>
                      <p className="text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                      <p className="text-gray-600">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                      <p className="text-gray-600">{addr.country} · {addr.phone}</p>
                      {addr.isDefault && <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full">Default</span>}
                    </div>
                  </label>
                ))}
                <button onClick={() => router.push('/addresses')} className="text-indigo-600 font-semibold text-sm hover:text-purple-600 transition-colors">+ Add new address</button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🛒 Items ({totalItems()})</h2>
            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.id} className="py-3 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-xl">🎵</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">¥{item.price.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-800 text-sm">¥{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>¥{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `¥${shipping.toLocaleString()}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon ({couponCode})</span><span>−¥{discount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-800 mt-4 pt-4 border-t-2 border-gray-200">
              <span>Total</span><span>¥{total.toLocaleString()}</span>
            </div>
          </div>

          {!clientSecret && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">🎟️ Coupon Code</h2>
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <span className="font-semibold text-green-700">{couponCode}</span>
                  <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-600 text-sm font-semibold transition-colors">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg('') }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponInput.trim()}
                    className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {validatingCoupon ? '…' : 'Apply'}
                  </button>
                </div>
              )}
              {couponMsg && <p className={`text-xs mt-2 font-medium ${couponMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>{couponMsg}</p>}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-md p-6">
            {clientSecret ? (
              <>
                <h2 className="text-lg font-bold text-gray-800 mb-4">💳 Payment Details</h2>
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#6366f1' } } }}
                >
                  <StripePaymentForm addressId={selectedAddressId} couponCode={couponCode} onBack={() => setClientSecret(null)} />
                </Elements>
              </>
            ) : (
              <button
                onClick={handleProceedToPayment}
                disabled={creatingIntent || items.length === 0 || addresses.length === 0}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {creatingIntent ? '⏳ Loading payment…' : '💳 Proceed to Payment'}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">Secured by Stripe · Your payment info is never stored on our servers.</p>
        </div>
      </div>
    </div>
  )
}
