// Caching for the product/category read paths only.
//
// Justification (see SCALE_AUDIT.md, Steps 2-3, audit run 2026-09-06): load
// testing found /api/products and /api/products/[id] throughput plateaus at
// ~36-40 req/s under concurrency, purely from queuing on the app's DB
// connection pool. Product/category data changes only via low-volume admin
// writes, so caching these specific reads directly cuts DB round trips on
// the hot path without touching per-user data (cart, orders, wishlist,
// addresses), which must NOT be cached this way — see Step 3 for why.
//
// Uses Next's built-in unstable_cache (time + tag based) rather than an
// external cache layer (Redis). There's a single Postgres instance as the
// source of truth and no cross-instance cache-consistency problem to solve,
// so Redis isn't justified here — see SCALE_AUDIT.md Step 3.
//
// One tag for both products and categories (rather than two finer-grained
// ones): product listings embed category names, and category listings embed
// product counts, so a mutation on either side can stale the other. Given
// how infrequently admin writes happen, invalidating both together is
// simpler and safer than tracking cross-invalidation between two tags.
import { unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'

const CATALOG_TAG = 'catalog'
const REVALIDATE_SECONDS = 60

/** Call after any product or category create/update/delete. */
export function invalidateCatalogCache() {
  // Next.js 16 requires a second "profile" argument for revalidateTag —
  // 'max' forces immediate full invalidation (the pre-16 single-arg
  // behavior), matching what an admin write should do here.
  revalidateTag(CATALOG_TAG, 'max')
}

export const getCachedProductList = unstable_cache(
  async (
    q: string | undefined,
    categoryId: number | undefined,
    sort: 'name' | 'price' | 'createdAt',
    dir: 'asc' | 'desc',
    page: number,
    size: number
  ) => {
    const where = {
      ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
      ...(categoryId ? { categoryId } : {}),
    }
    const orderBy = { [sort]: dir }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: page * size,
        take: size,
      }),
      prisma.product.count({ where }),
    ])

    return { products, total }
  },
  ['product-list'],
  { revalidate: REVALIDATE_SECONDS, tags: [CATALOG_TAG] }
)

export const getCachedProduct = unstable_cache(
  async (id: number) => {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    })
    if (!product) return null

    // Related products: same category, excluding this one. In-stock items
    // surface first so a related product isn't just an immediate dead end.
    const relatedProducts = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      include: { category: true },
      orderBy: [{ stock: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    })

    return { product, relatedProducts }
  },
  ['product-detail'],
  { revalidate: REVALIDATE_SECONDS, tags: [CATALOG_TAG] }
)

export const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
  },
  ['category-list'],
  { revalidate: REVALIDATE_SECONDS, tags: [CATALOG_TAG] }
)
