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
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingCart,
  Tag,
  X,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'
import { PriceTag } from '@/components/PriceTag'
import { cn } from '@/lib/utils'
import { resolveCssColor } from '@/lib/resolve-css-color'
import { calculateShipping } from '@/lib/pricing'

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
        <Button type="button" variant="outline" onClick={onBack} disabled={paying} className="flex-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="submit" disabled={!stripe || paying} className="flex-2">
          {paying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Pay now
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { status } = useSession()
  const router = useRouter()
  const { items, totalPrice, totalItems, fetchCart } = useCart()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)

  const [couponInput, setCouponInput] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
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
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-8 h-9 w-40" />
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  const subtotal = totalPrice()
  const shipping = calculateShipping(subtotal)
  const total = Math.max(0, subtotal + shipping - discount)

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setValidatingCoupon(true)
    setCouponError('')
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
        toast.success(`Coupon applied — ¥${data.discount.toLocaleString()} off`)
      } else {
        setCouponCode('')
        setDiscount(0)
        setCouponError(data.error ?? 'Invalid coupon')
      }
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponInput('')
    setDiscount(0)
    setCouponError('')
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 page-enter">
      <PageHeader title="Checkout" />

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          <fieldset className="rounded-lg border border-border bg-surface p-6">
            <legend className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <MapPin className="h-4 w-4" strokeWidth={2} />
              Shipping address
            </legend>
            {addresses.length === 0 ? (
              <div className="py-8 text-center">
                <p className="mb-4 text-sm text-muted-foreground">
                  No saved addresses. Please add one first.
                </p>
                <Button onClick={() => router.push('/addresses')}>Add address</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors',
                      selectedAddressId === addr.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground/40'
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr.id}
                      onChange={() => { setSelectedAddressId(addr.id); setClientSecret(null) }}
                      className="mt-1 accent-primary"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{addr.recipientName}</p>
                      <p className="text-muted-foreground">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                      </p>
                      <p className="text-muted-foreground">
                        {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}
                      </p>
                      <p className="text-muted-foreground">{addr.country} · {addr.phone}</p>
                      {addr.isDefault && (
                        <Badge variant="outline" className="mt-1.5 text-muted-foreground">
                          Default
                        </Badge>
                      )}
                    </div>
                  </label>
                ))}
                <Button variant="ghost" size="sm" onClick={() => router.push('/addresses')}>
                  + Add new address
                </Button>
              </div>
            )}
          </fieldset>

          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              Items ({totalItems()})
            </h2>
            <div className="divide-y divide-border">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 py-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs font-bold tracking-tight text-muted-foreground/40">VC</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ¥{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <PriceTag value={item.price * item.quantity} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 border-b border-border pb-4 text-lg font-bold text-foreground">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `¥${shipping.toLocaleString()}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Coupon ({couponCode})</span><span>−¥{discount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold text-foreground">Total</span>
              <PriceTag value={total} size="lg" />
            </div>
          </div>

          {!clientSecret && (
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Tag className="h-4 w-4" strokeWidth={2} />
                Coupon code
              </h2>
              {couponCode ? (
                <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
                    {couponCode}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <label htmlFor="coupon-code-input" className="sr-only">Coupon code</label>
                  <Input
                    id="coupon-code-input"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    aria-invalid={!!couponError}
                    aria-describedby={couponError ? 'coupon-code-error' : undefined}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponInput.trim()}
                  >
                    {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              )}
              {couponError && (
                <p id="coupon-code-error" role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                  {couponError}
                </p>
              )}
            </div>
          )}

          <div className="rounded-lg border border-border bg-surface p-6">
            {clientSecret ? (
              <>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                  <CreditCard className="h-4 w-4" strokeWidth={2} />
                  Payment details
                </h2>
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: resolveCssColor('--secondary'),
                        colorBackground: resolveCssColor('--surface'),
                        colorText: resolveCssColor('--foreground'),
                        colorTextSecondary: resolveCssColor('--muted-foreground'),
                        colorDanger: resolveCssColor('--destructive'),
                        borderRadius: '8px',
                        fontFamily: 'inherit',
                      },
                    },
                  }}
                >
                  <StripePaymentForm addressId={selectedAddressId} couponCode={couponCode} onBack={() => setClientSecret(null)} />
                </Elements>
              </>
            ) : (
              <Button
                size="lg"
                className="w-full"
                onClick={handleProceedToPayment}
                disabled={creatingIntent || items.length === 0 || addresses.length === 0}
              >
                {creatingIntent ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading payment…
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Proceed to payment
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
            Secured by Stripe · Your payment info is never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  )
}
