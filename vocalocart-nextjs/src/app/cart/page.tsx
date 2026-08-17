'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useFormatter, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'
import { PriceTag } from '@/components/PriceTag'
import { QuantityStepper } from '@/components/QuantityStepper'
import { EmptyState } from '@/components/EmptyState'
import { calculateShipping, calculateTax, FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'

export default function CartPage() {
  const t = useTranslations('Cart')
  const ts = useTranslations('OrderSummary')
  const tc = useTranslations('Common')
  const format = useFormatter()
  const { status } = useSession()
  const router = useRouter()
  const { items, loading, fetchCart, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart()
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') fetchCart().finally(() => setFetched(true))
  }, [status])

  const handleClear = async () => {
    await clearCart()
    toast.success(t('cartCleared'))
  }

  const handleRemove = async (id: number) => {
    await removeItem(id)
    toast.success(t('itemRemoved'))
  }

  if (status === 'loading' || loading || !fetched) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-8 h-9 w-48" />
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4 rounded-lg border border-border bg-surface p-4 sm:p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-24 w-24 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  const subtotal = totalPrice()
  const shipping = subtotal > 0 ? calculateShipping(subtotal) : 0
  const tax = calculateTax(subtotal, 0)
  const total = subtotal + shipping + tax

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 page-enter">
      <PageHeader
        title={t('title')}
        description={t('itemCount', { count: totalItems() })}
        actions={
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              {t('continueShopping')}
            </Link>
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={
            <Button asChild>
              <Link href="/">{tc('shopNow')}</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">{t('itemsHeading')}</h2>
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                {t('clearAll')}
              </Button>
            </div>

            <div className="divide-y divide-border">
              {items.map(item => (
                <div
                  key={item.id}
                  className="grid grid-cols-[80px_1fr] items-center gap-4 py-4 sm:grid-cols-[96px_1fr_auto]"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-lg font-bold tracking-tight text-muted-foreground/40">
                          VC
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Link
                      href={`/product/${item.productId}`}
                      className="text-sm font-medium text-foreground transition-colors hover:text-secondary sm:text-base"
                    >
                      {item.name}
                    </Link>
                    <PriceTag value={item.price} size="sm" />
                    <div className="mt-1 flex items-center gap-3">
                      <QuantityStepper
                        value={item.quantity}
                        max={item.stock}
                        onChange={q => updateQuantity(item.id, q)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        {tc('remove')}
                      </Button>
                    </div>
                  </div>

                  <div className="hidden text-right sm:block">
                    <PriceTag value={item.price * item.quantity} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="sticky top-24 rounded-lg border border-border bg-surface p-6">
            <h2 className="mb-4 border-b border-border pb-4 text-lg font-bold text-foreground">
              {ts('title')}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>{ts('subtotalWithCount', { count: totalItems() })}</span>
                <span>¥{format.number(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{ts('shipping')}</span>
                <span>{shipping === 0 ? ts('free') : `¥${format.number(shipping)}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground/70">
                  {ts('freeShippingNote', { amount: format.number(FREE_SHIPPING_THRESHOLD) })}
                </p>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>{ts('tax')}</span>
                <span>¥{format.number(tax)}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold text-foreground">{ts('total')}</span>
              <PriceTag value={total} size="lg" />
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={() => router.push('/checkout')}>
              {t('proceedToCheckout')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
