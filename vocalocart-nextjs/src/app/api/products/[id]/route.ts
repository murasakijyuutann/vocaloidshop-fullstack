import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().int().positive().optional(),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().url().nullable().optional(),
  categoryId: z.number().int().positive().optional(),
})

// GET /api/products/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // Related products: same category, excluding this one. In-stock items
    // surface first so a related product isn't just an immediate dead end.
    const relatedProducts = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      include: { category: true },
      orderBy: [{ stock: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    })

    return NextResponse.json({ product, relatedProducts })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT /api/products/[id] — admin only
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: parsed.data,
      include: { category: true },
    })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/products/[id] — admin only
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    await prisma.product.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Product deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

// PATCH /api/products/[id] — alias for PUT, admin only
export { PUT as PATCH }
