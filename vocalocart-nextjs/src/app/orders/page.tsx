'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

interface OrderItem {
  id: number
  productName: string
  quantity: number
  price: number
  imageUrl?: string | null
}

interface Order {
  id: number
  status: string
  totalAmount: number
  createdAt: string
  shipRecipientName?: string | null
  items: OrderItem[]
}

const STATUS_COLORS: Record<string, string> = {
  PAYMENT_RECEIVED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  READY_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
  IN_DELIVERY: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELED: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  PAYMENT_RECEIVED: '💳 Payment Received',
  PROCESSING: '⚙️ Processing',
  PREPARING: '📦 Preparing',
  READY_FOR_DELIVERY: '🚚 Ready for Delivery',
  IN_DELIVERY: '🛵 In Delivery',
  DELIVERED: '✅ Delivered',
  CANCELED: '❌ Canceled',
}

export default function OrdersPage() {
  const { status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/orders')
        .then(r => r.json())
        .then(d => setOrders(d.orders ?? []))
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
      setOrders(ords => ords.map(o => o.id === id ? { ...o, status: 'CANCELED' } : o))
      toast.success('Order canceled')
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Cannot cancel this order')
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">📦 My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md text-center py-16 px-6">
          <p className="text-5xl mb-4">📦</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
          <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Order header */}
              <button
                className="w-full p-4 sm:p-6 flex flex-wrap items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-800">Order #{order.id}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {order.shipRecipientName && ` · To: ${order.shipRecipientName}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600 text-lg">¥{order.totalAmount.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs mt-1">{expanded === order.id ? '▲ Hide' : '▼ Details'}</p>
                </div>
              </button>

              {/* Expanded items */}
              {expanded === order.id && (
                <div className="border-t border-gray-100 p-4 sm:p-6">
                  <div className="divide-y divide-gray-100 mb-4">
                    {order.items.map(item => (
                      <div key={item.id} className="py-3 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl overflow-hidden shrink-0">
                          {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" /> : '🎵'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
                          <p className="text-gray-500 text-xs">¥{item.price.toLocaleString()} × {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-800 text-sm">¥{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {(order.status === 'PAYMENT_RECEIVED' || order.status === 'PROCESSING') && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      className="px-4 py-2 text-red-500 border-2 border-red-200 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                      ❌ Cancel Order
                    </button>
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
