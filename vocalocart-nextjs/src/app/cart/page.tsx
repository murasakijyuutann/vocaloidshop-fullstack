'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, loading, fetchCart, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart()
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') fetchCart().finally(() => setFetched(true))
  }, [status])

  if (status === 'loading' || loading || !fetched) {
    return <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>
  }

  const handleClear = async () => {
    await clearCart()
    toast.success('Cart cleared')
  }

  const handleRemove = async (id: number) => {
    await removeItem(id)
    toast.success('Item removed')
  }

  const subtotal = totalPrice()
  const shipping = subtotal > 0 ? (subtotal >= 5000 ? 0 : 500) : 0
  const total = subtotal + shipping

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 flex items-center gap-3">
          🛒 Your Cart
          <span className="text-xl font-normal text-gray-500">({totalItems()} items)</span>
        </h1>
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 border-2 border-indigo-500 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
          ← Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md text-center py-20 px-6">
          <p className="text-6xl mb-4">🛒</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some Vocaloid merch to get started!</p>
          <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Items */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Items</h2>
              <button onClick={handleClear} className="text-red-500 text-sm font-semibold hover:text-red-700 transition-colors">
                🗑️ Clear all
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map(item => (
                <div key={item.id} className="py-4 grid grid-cols-[80px_1fr] sm:grid-cols-[100px_1fr_auto] gap-4 items-center">
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl overflow-hidden shrink-0">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      : '🎵'}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1">
                    <Link href={`/product/${item.productId}`} className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors text-sm sm:text-base">
                      {item.name}
                    </Link>
                    <p className="text-indigo-600 font-semibold">¥{item.price.toLocaleString()}</p>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-gray-50 text-indigo-600 font-bold hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                        >−</button>
                        <span className="w-10 text-center font-semibold text-gray-800 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center bg-gray-50 text-indigo-600 font-bold hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                        >+</button>
                      </div>
                      <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600 text-sm font-semibold transition-colors">
                        🗑️ Remove
                      </button>
                    </div>
                  </div>

                  {/* Subtotal (desktop) */}
                  <div className="hidden sm:block text-right font-bold text-gray-800 text-lg">
                    ¥{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-4 border-b border-gray-100">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems()} items)</span>
                <span>¥{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-semibold">FREE</span> : `¥${shipping.toLocaleString()}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Free shipping on orders ¥5,000+</p>
              )}
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-800 mt-4 pt-4 border-t-2 border-gray-200">
              <span>Total</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full mt-5 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              🚀 Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
