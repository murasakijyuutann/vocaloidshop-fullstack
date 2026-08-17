'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/PageHeader'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { ORDER_STATUSES, ORDER_STATUS_LABELS_EN, type OrderStatus } from '@/lib/order-status'

interface Order {
  id: number
  status: OrderStatus
  totalAmount: number
  orderedAt: string
  user: { name: string; email: string }
  shipRecipientName?: string | null
  orderItems: { id: number }[]
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [filter, setFilter] = useState<OrderStatus | ''>('')

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      if (!session?.user?.isAdmin) { router.push('/'); return }
      fetch('/api/admin/orders').then(r => r.json()).then(d => setOrders(d.orders ?? [])).finally(() => setLoading(false))
    }
  }, [status, session, router])

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)))
        toast.success(`Order #${orderId} updated to ${ORDER_STATUS_LABELS_EN[newStatus]}`)
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to update order')
      }
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-8 h-9 w-56" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 page-enter">
      <PageHeader
        title="Admin – Orders"
        description={`${filtered.length} order${filtered.length === 1 ? '' : 's'}`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant={filter === '' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('')}>
          All ({orders.length})
        </Button>
        {ORDER_STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length
          if (count === 0) return null
          return (
            <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)}>
              {ORDER_STATUS_LABELS_EN[s]} ({count})
            </Button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Items</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(order => (
                <tr key={order.id} className="transition-colors hover:bg-accent">
                  <td className="px-4 py-3 font-bold text-foreground">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{order.user.name}</p>
                    <p className="text-xs text-muted-foreground">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(order.orderedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.orderItems.length}</td>
                  <td className="px-4 py-3 font-semibold text-secondary">¥{order.totalAmount.toLocaleString('en-US')}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} label={ORDER_STATUS_LABELS_EN[order.status]} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Select
                        value={order.status}
                        onValueChange={v => handleStatusChange(order.id, v as OrderStatus)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger size="sm" className="w-45">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map(s => (
                            <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS_EN[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {updatingId === order.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" strokeWidth={2} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
