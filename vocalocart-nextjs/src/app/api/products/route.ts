import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const searchSchema = z.object({
  q: z.string().trim().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  sort: z.enum(['name', 'price', 'createdAt']).default('name'),
  dir: z.enum(['asc', 'desc']).default('asc'),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(50).default(12),
})

// GET /api/products?q=&categoryId=&sort=name&dir=asc&page=0&size=12
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = searchSchema.safeParse({
      q: searchParams.get('q') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      sort: searchParams.get('sort') ?? undefined,
      dir: searchParams.get('dir') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      size: searchParams.get('size') ?? undefined,
    })
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { q, categoryId, sort, dir, page, size } = parsed.data

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

    return NextResponse.json({
      products,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
      page,
      size,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  // .nonnegative() (not .positive()) deliberately allows 0 — a $0 price is
  // unlikely but a 0-stock (out-of-stock) product is a legitimate state that
  // the old truthy check (`!stock`) incorrectly rejected.
  price: z.coerce.number().int().nonnegative('Price must be zero or more'),
  stock: z.coerce.number().int().nonnegative('Stock must be zero or more'),
  imageUrl: z.string().optional(),
  categoryId: z.coerce.number().int().positive('categoryId is required'),
})

// POST /api/products - Create product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const { name, description, price, stock, imageUrl, categoryId } = parsed.data

    const product = await prisma.product.create({
      data: { name, description, price, stock, imageUrl, categoryId },
      include: {
        category: true
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
