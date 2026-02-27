'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'

interface Product {
  id: number
  name: string
  price: number
  imageUrl?: string | null
  stock: number
  category?: { name: string } | null
}

interface Category {
  id: number
  name: string
}

export default function HomePage() {
  const { data: session } = useSession()
  const addItem = useCart(s => s.addItem)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('name')
  const [dir, setDir] = useState('asc')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const SIZE = 12

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories ?? []))
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort, dir, page: String(page), size: String(SIZE) })
    if (q) params.set('q', q)
    if (categoryId) params.set('categoryId', categoryId)
    try {
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products ?? [])
      setTotalPages(data.totalPages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [q, categoryId, sort, dir, page])

  useEffect(() => { loadProducts() }, [loadProducts])

  const handleAddToCart = async (productId: number) => {
    if (!session) { toast.info('Please log in to add items to cart'); return }
    try {
      await addItem(productId)
      toast.success('Added to cart! 🛒')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add to cart')
    }
  }

  const handleWishlist = async (productId: number) => {
    if (!session) { toast.info('Please log in to use wishlist'); return }
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) toast.success('Added to wishlist! ❤️')
      else toast.info('Already in wishlist')
    } catch { toast.error('Failed to update wishlist') }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white text-center py-12 px-6 mb-8 shadow-lg">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2">🎵 VocaloCart</h1>
        <p className="text-white/90 text-lg">Your ultimate destination for Vocaloid merchandise</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <input
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-gray-50 transition-colors"
          placeholder="🔍 Search products..."
          value={q}
          onChange={e => { setQ(e.target.value); setPage(0) }}
        />
        <select
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setPage(0) }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(0) }}
        >
          <option value="name">Sort: Name</option>
          <option value="price">Sort: Price</option>
          <option value="createdAt">Sort: Newest</option>
        </select>
        <select
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
          value={dir}
          onChange={e => { setDir(e.target.value); setPage(0) }}
        >
          <option value="asc">↑ Ascending</option>
          <option value="desc">↓ Descending</option>
        </select>
      </div>

      {/* Product grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md text-center py-16 px-6">
          <p className="text-5xl mb-4">😢</p>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No products found</h2>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <div className="relative h-48 sm:h-56 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    : '🎵'}
                  <button
                    onClick={() => handleWishlist(p.id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center text-lg shadow-md hover:scale-110 transition-transform"
                    title="Add to wishlist"
                  >❤️</button>
                </div>
                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  {p.category && (
                    <span className="inline-block mb-2 px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                      {p.category.name}
                    </span>
                  )}
                  <Link href={`/product/${p.id}`} className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors line-clamp-2 mb-2 text-sm sm:text-base">
                    {p.name}
                  </Link>
                  <p className="text-indigo-600 font-bold text-xl mb-3 mt-auto">¥{p.price.toLocaleString()}</p>
                  <button
                    onClick={() => handleAddToCart(p.id)}
                    disabled={p.stock === 0}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
                  >
                    {p.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl shadow-md flex items-center justify-center gap-4 p-4">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all"
              >
                ← Previous
              </button>
              <span className="font-semibold text-gray-700">Page {page + 1} of {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

