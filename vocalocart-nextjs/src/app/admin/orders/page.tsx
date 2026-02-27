'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const ALL_STATUSES = ['PAYMENT_RECEIVED', 'PROCESSING', 'PREPARING', 'READY_FOR_DELIVERY', 'IN_DELIVERY', 'DELIVERED', 'CANCELED'] as const
type OrderStatus = typeof ALL_STATUSES[number]

const STATUS_COLORS: Record<OrderStatus, string> = {
  PAYMENT_RECEIVED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  READY_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  IN_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELED: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PAYMENT_RECEIVED: '💳 Payment Received',
  PROCESSING: '⚙️ Processing',
  PREPARING: '📦 Preparing',
  READY_FOR_DELIVERY: '🚚 Ready for Delivery',
  IN_DELIVERY: '🛵 In Delivery',
  DELIVERED: '✅ Delivered',
  CANCELED: '❌ Canceled',
}

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
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        toast.success(`Order #${orderId} updated to ${STATUS_LABELS[newStatus]}`)
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to update order')
      }
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">⚙️ Admin – Orders</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-semibold">{filtered.length}</span> orders
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${filter === '' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'}`}
        >
          All ({orders.length})
        </button>
        {ALL_STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length
          if (count === 0) return null
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${filter === s ? 'bg-indigo-600 text-white' : `${STATUS_COLORS[s]} hover:opacity-80`}`}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          )
        })}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Order</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Items</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Total</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-800">#{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">{order.user.name}</p>
                    <p className="text-gray-500 text-xs">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(order.orderedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{order.orderItems.length}</td>
                  <td className="px-4 py-3 font-bold text-indigo-600">¥{order.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={updatingId === order.id}
                      className="text-xs border-2 border-gray-200 rounded-xl px-2 py-1.5 bg-white focus:outline-none focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
                    >
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
