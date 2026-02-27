'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import Link from 'next/link'

interface WishlistItem {
  id: number
  product: {
    id: number
    name: string
    price: number
    imageUrl?: string | null
    stock: number
    category?: { name: string } | null
  }
  createdAt: string
}

export default function WishlistPage() {
  const { status } = useSession()
  const router = useRouter()
  const addItem = useCart(s => s.addItem)
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/wishlist').then(r => r.ok ? r.json() : null).then(d => setItems(d?.items ?? [])).finally(() => setLoading(false))
    }
  }, [status, router])

  const handleRemove = async (productId: number) => {
    const res = await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.product.id !== productId))
      toast.success('Removed from wishlist')
    }
  }

  const handleAddToCart = async (productId: number, name: string) => {
    try {
      await addItem(productId)
      toast.success(`${name} added to cart! 🛒`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add to cart')
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">❤️ My Wishlist</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md text-center py-16 px-6">
          <p className="text-5xl mb-4">❤️</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love and buy them later!</p>
          <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map(({ id, product }) => (
            <div key={id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl">
                {product.imageUrl
                  ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  : '🎵'}
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-sm shadow hover:scale-110 hover:bg-red-50 transition-all"
                  title="Remove from wishlist"
                >✕</button>
              </div>
              <div className="p-4 flex flex-col flex-1">
                {product.category && (
                  <span className="inline-block mb-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full w-fit">{product.category.name}</span>
                )}
                <Link href={`/product/${product.id}`} className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors line-clamp-2 mb-2 text-sm flex-1">
                  {product.name}
                </Link>
                <p className="text-indigo-600 font-bold text-lg mb-3">¥{product.price.toLocaleString()}</p>
                <button
                  onClick={() => handleAddToCart(product.id, product.name)}
                  disabled={product.stock === 0}
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                >
                  {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
