'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Heart, ShoppingCart, Loader2, PackageX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PriceTag } from '@/components/PriceTag'
import { QuantityStepper } from '@/components/QuantityStepper'
import { EmptyState } from '@/components/EmptyState'

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
      toast.success(`Added ${qty}× to cart`)
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
    if (res.ok) toast.success('Added to wishlist')
    else toast.info('Already in wishlist')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-6 h-5 w-28" />
        <div className="grid overflow-hidden rounded-lg border border-border bg-surface md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-none md:aspect-auto md:h-full" />
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-auto h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 page-enter">
        <EmptyState
          icon={PackageX}
          title="Product not found"
          description="It may have been removed or the link is incorrect."
          action={
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to shop
              </Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 page-enter">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        Back to shop
      </Link>

      <div className="grid overflow-hidden rounded-lg border border-border bg-surface md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square bg-muted md:aspect-auto">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-64 w-full items-center justify-center">
              <span className="text-4xl font-bold tracking-tight text-muted-foreground/40">
                VC
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col p-6 sm:p-8">
          {product.category && (
            <Badge variant="outline" className="mb-3 w-fit text-muted-foreground">
              {product.category.name}
            </Badge>
          )}

          <h1 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          <PriceTag value={product.price} size="lg" className="mb-4" />

          {product.description && (
            <p className="mb-6 leading-relaxed text-muted-foreground">{product.description}</p>
          )}

          <div className="mb-6 flex items-center gap-2 text-sm font-medium">
            {product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                In stock ({product.stock} available)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-destructive">
                <XCircle className="h-4 w-4" strokeWidth={2} />
                Out of stock
              </span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="mb-6 flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Qty</span>
              <QuantityStepper value={qty} max={product.stock} onChange={setQty} />
            </div>
          )}

          <div className="mt-auto flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || adding}
            >
              {adding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                  Adding…
                </>
              ) : product.stock === 0 ? (
                'Out of stock'
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                  Add to cart
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              title="Add to wishlist"
            >
              <Heart className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
