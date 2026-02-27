'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import Link from 'next/link'

interface Product {
  id: number
  name: string
  description?: string | null
  price: number
  stock: number
  imageUrl?: string | null
  category?: { id: number; name: string } | null
  createdAt: string
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const addItem = useCart(s => s.addItem)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setProduct(d?.product ?? null))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!session) { toast.info('Please log in to add items to cart'); router.push('/login'); return }
    setAdding(true)
    try {
      await addItem(Number(id), qty)
      toast.success(`Added ${qty}× to cart! 🛒`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async () => {
    if (!session) { toast.info('Please log in to use wishlist'); return }
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: Number(id) }),
    })
    if (res.ok) toast.success('Added to wishlist! ❤️')
    else toast.info('Already in wishlist')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 page-enter">
        <p className="text-6xl mb-4">😢</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
        <Link href="/" className="text-indigo-600 font-semibold hover:text-purple-600">← Back to shop</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-purple-600 transition-colors mb-6">
        ← Back to shop
      </Link>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden grid md:grid-cols-2 gap-0">
        {/* Image */}
        <div className="h-72 md:h-auto bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-8xl min-h-64">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            : '🎵'}
        </div>

        {/* Info */}
        <div className="p-6 sm:p-8 flex flex-col">
          {product.category && (
            <span className="inline-block mb-3 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full w-fit">
              {product.category.name}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>
          <p className="text-4xl font-bold text-indigo-600 mb-4">¥{product.price.toLocaleString()}</p>

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          )}

          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-green-600 font-semibold text-sm">✅ In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500 font-semibold text-sm">❌ Out of stock</span>
            )}
          </div>

          {/* Quantity */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <span className="font-semibold text-gray-700 text-sm">Qty:</span>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 text-indigo-600 font-bold hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >−</button>
                <span className="w-12 text-center font-semibold text-gray-800">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 text-indigo-600 font-bold hover:bg-indigo-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >+</button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-auto">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
              className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {adding ? '⏳ Adding…' : product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
            <button
              onClick={handleWishlist}
              className="w-14 h-14 flex items-center justify-center border-2 border-gray-200 rounded-xl text-xl hover:border-red-400 hover:bg-red-50 transition-colors"
              title="Add to wishlist"
            >❤️</button>
          </div>
        </div>
      </div>
    </div>
  )
}
