import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'

// This is a Server Component wrapping the client PDP (`page.tsx`) purely to
// supply per-product <head> metadata and JSON-LD — the page itself stays a
// 'use client' component with its own data fetching, per the project's
// "no RSC migration" constraint. The extra product lookup here is a
// deliberate, small duplicate of the one in `page.tsx`'s effect.
async function getProduct(id: string) {
  const productId = Number(id)
  if (!Number.isFinite(productId)) return null
  return prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  })
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  const t = await getTranslations('Metadata')

  if (!product) {
    return { title: t('productNotFound') }
  }

  const description =
    product.description?.slice(0, 160) ??
    t('productDescriptionFallback', { name: product.name })

  return {
    title: t('productTitleTemplate', { name: product.name }),
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  const jsonLd = product && {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.imageUrl ?? undefined,
    category: product.category?.name,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'JPY',
      price: product.price,
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
