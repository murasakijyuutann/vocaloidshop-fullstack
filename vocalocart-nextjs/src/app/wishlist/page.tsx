'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'
import { toast } from 'sonner'
import Link from 'next/link'
import { Heart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/ProductCard'
import { EmptyState } from '@/components/EmptyState'

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
  const t = useTranslations('Wishlist')
  const tc = useTranslations('Common')
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
      toast.success(t('removedFromWishlist'))
    }
  }

  const handleAddToCart = async (productId: number) => {
    try {
      await addItem(productId)
      toast.success(tc('addedToCart'))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : tc('addToCartFailed'))
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 page-enter">
      <h1 className="mb-8 flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground">
        <Heart className="h-7 w-7" strokeWidth={2} />
        {t('title')}
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          action={
            <Button asChild>
              <Link href="/">{t('browseShop')}</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {items.map(({ id, product }) => (
            <ProductCard
              key={id}
              product={product}
              onAddToCart={handleAddToCart}
              cornerAction={{ icon: X, label: t('removeFromWishlist'), onClick: handleRemove }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
