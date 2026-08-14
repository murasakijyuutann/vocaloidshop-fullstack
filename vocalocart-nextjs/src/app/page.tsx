'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import { Heart, Search, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductCard, type ProductCardProduct } from '@/components/ProductCard'
import { EmptyState } from '@/components/EmptyState'

interface Category {
  id: number
  name: string
}

const SIZE = 12
const ALL_CATEGORIES = 'all'

export default function HomePage() {
  const { data: session } = useSession()
  const addItem = useCart(s => s.addItem)

  const [products, setProducts] = useState<ProductCardProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [q, setQ] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [sort, setSort] = useState('name')
  const [dir, setDir] = useState('asc')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

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
      toast.success('Added to cart')
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
      if (res.ok) toast.success('Added to wishlist')
      else toast.info('Already in wishlist')
    } catch { toast.error('Failed to update wishlist') }
  }

  return (
    <div className="page-enter">
      {/* Hero — full-bleed, shares the page background, separated by a hairline */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            VocaloCart
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
            Your destination for Vocaloid merchandise
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 gap-3 border-b border-border pb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products..."
              value={q}
              onChange={e => { setQ(e.target.value); setPage(0) }}
            />
          </div>

          <Select
            value={categoryId || ALL_CATEGORIES}
            onValueChange={v => { setCategoryId(v === ALL_CATEGORIES ? '' : v); setPage(0) }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={v => { setSort(v); setPage(0) }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort: Name</SelectItem>
              <SelectItem value="price">Sort: Price</SelectItem>
              <SelectItem value="createdAt">Sort: Newest</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dir} onValueChange={v => { setDir(v); setPage(0) }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: SIZE }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="flex flex-col gap-2 p-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={handleAddToCart}
                  cornerAction={{ icon: Heart, label: 'Add to wishlist', onClick: handleWishlist }}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
