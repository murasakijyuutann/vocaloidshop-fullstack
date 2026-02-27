import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/products?q=&categoryId=&sort=name&dir=asc&page=0&size=12
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q          = searchParams.get('q') ?? ''
    const categoryId = searchParams.get('categoryId')
    const sort       = searchParams.get('sort') ?? 'name'
    const dir        = (searchParams.get('dir') ?? 'asc') as 'asc' | 'desc'
    const page       = Math.max(0, parseInt(searchParams.get('page') ?? '0'))
    const size       = Math.min(50, parseInt(searchParams.get('size') ?? '12'))

    const where = {
      ...(q ? { name: { contains: q, mode: 'insensitive' as const } } : {}),
      ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
    }

    const orderBy: Record<string, string> = {}
    const validSorts = ['name', 'price', 'createdAt']
    orderBy[validSorts.includes(sort) ? sort : 'name'] = dir

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
    const { name, description, price, stock, imageUrl, categoryId } = body

    // Validation
    if (!name || !price || !stock || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseInt(price),
        stock: parseInt(stock),
        imageUrl,
        categoryId: parseInt(categoryId)
      },
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
