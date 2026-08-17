'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useFormatter, useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, Heart, ShoppingCart, Loader2, PackageX, Truck, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PriceTag } from '@/components/PriceTag'
import { QuantityStepper } from '@/components/QuantityStepper'
import { EmptyState } from '@/components/EmptyState'
import { ProductCard, type ProductCardProduct } from '@/components/ProductCard'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/pricing'

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
  const t = useTranslations('Product')
  const tc = useTranslations('Common')
  const format = useFormatter()
  const { id } = useParams<{ id: string }>()
  const { data: session } = useSession()
  const router = useRouter()
  const addItem = useCart(s => s.addItem)

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ProductCardProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setProduct(d?.product ?? null)
        setRelatedProducts(d?.relatedProducts ?? [])
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!session) { toast.info(tc('loginToAddCart')); router.push('/login'); return }
    setAdding(true)
    try {
      await addItem(Number(id), qty)
      toast.success(t('addedQtyToCart', { qty }))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : tc('addToCartFailed'))
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async () => {
    if (!session) { toast.info(tc('loginToWishlist')); return }
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: Number(id) }),
    })
    if (res.ok) toast.success(tc('addedToWishlist'))
    else toast.info(tc('alreadyInWishlist'))
  }

  const handleAddRelatedToCart = async (productId: number) => {
    if (!session) { toast.info(tc('loginToAddCart')); router.push('/login'); return }
    try {
      await addItem(productId)
      toast.success(tc('addedToCart'))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : tc('addToCartFailed'))
    }
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
          title={t('notFoundTitle')}
          description={t('notFoundDescription')}
          action={
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                {t('backToShop')}
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
        {t('backToShop')}
      </Link>

      <div className="grid overflow-hidden rounded-lg border border-border bg-surface md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square bg-muted md:aspect-auto">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
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
                {t('inStock', { count: product.stock })}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-destructive">
                <XCircle className="h-4 w-4" strokeWidth={2} />
                {t('outOfStock')}
              </span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="mb-6 flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">{t('qty')}</span>
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
                  {t('adding')}
                </>
              ) : product.stock === 0 ? (
                t('outOfStock')
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                  {t('addToCart')}
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlist}
              aria-label={tc('addToWishlist')}
              title={tc('addToWishlist')}
            >
              <Heart className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>

          <div className="mt-5 space-y-2.5 border-t border-border pt-5 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              {product.price >= FREE_SHIPPING_THRESHOLD ? (
                <span>{t('freeShippingQualifies')}</span>
              ) : (
                <span>
                  {t('standardShipping', { amount: format.number(FREE_SHIPPING_THRESHOLD) })}
                </span>
              )}
            </p>
            <p className="flex items-start gap-2">
              <RotateCcw className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{t('returns')}</span>
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">
            {t('relatedTitle')}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddRelatedToCart} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
