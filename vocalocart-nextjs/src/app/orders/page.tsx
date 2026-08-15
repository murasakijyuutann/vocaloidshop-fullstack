'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ChevronDown, Package, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { PriceTag } from '@/components/PriceTag'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/order-status'

interface OrderItem {
  id: number
  quantity: number
  price: number
  product: {
    name: string
    imageUrl?: string | null
  }
}

interface Order {
  id: number
  status: OrderStatus
  totalAmount: number
  orderedAt: string
  shipRecipientName?: string | null
  orderItems: OrderItem[]
}

export default function OrdersPage() {
  const { status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/orders')
        .then(r => r.json())
        .then(d => setOrders(d.orders ?? []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false))
    }
  }, [status, router])

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this order?')) return
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel' }),
    })
    if (res.ok) {
      setOrders(ords => ords.map(o => (o.id === id ? { ...o, status: 'CANCELED' } : o)))
      toast.success('Order canceled')
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Cannot cancel this order')
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 page-enter">
      <PageHeader title="My Orders" />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Start shopping to see your orders here."
          action={
            <Button asChild>
              <Link href="/">Shop now</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="overflow-hidden rounded-lg border border-border bg-surface">
              <button
                className="flex w-full flex-wrap items-center gap-4 p-4 text-left transition-colors hover:bg-accent sm:p-6"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-foreground">Order #{order.id}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(order.orderedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {order.shipRecipientName && ` · To: ${order.shipRecipientName}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <PriceTag value={order.totalAmount} />
                  <ChevronDown
                    className={cn('h-4 w-4 text-muted-foreground transition-transform', expanded === order.id && 'rotate-180')}
                    strokeWidth={2}
                  />
                </div>
              </button>

              {expanded === order.id && (
                <div className="border-t border-border p-4 sm:p-6">
                  <div className="mb-4 divide-y divide-border">
                    {order.orderItems.map(item => (
                      <div key={item.id} className="flex items-center gap-4 py-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                          {item.product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-muted-foreground/40">VC</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ¥{item.price.toLocaleString()} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground">¥{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {(order.status === 'PAYMENT_RECEIVED' || order.status === 'PROCESSING') && (
                    <Button variant="outline" size="sm" onClick={() => handleCancel(order.id)}>
                      <X className="h-4 w-4" strokeWidth={2} />
                      Cancel order
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
