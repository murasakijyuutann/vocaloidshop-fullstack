'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
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
import { calculateShipping, calculateTax } from '@/lib/pricing'

export default function CartPage() {
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
    toast.success('Cart cleared')
  }

  const handleRemove = async (id: number) => {
    await removeItem(id)
    toast.success('Item removed')
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
        title="Your Cart"
        description={`${totalItems()} item${totalItems() === 1 ? '' : 's'}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Continue shopping
            </Link>
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add some Vocaloid merch to get started."
          action={
            <Button asChild>
              <Link href="/">Shop now</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="rounded-lg border border-border bg-surface p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Items</h2>
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                Clear all
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
                        Remove
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
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems()} items)</span>
                <span>¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `¥${shipping.toLocaleString()}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground/70">Free shipping on orders ¥5,000+</p>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>消費税 (10%)</span>
                <span>¥{tax.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold text-foreground">Total</span>
              <PriceTag value={total} size="lg" />
            </div>
            <Button size="lg" className="mt-5 w-full" onClick={() => router.push('/checkout')}>
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
