import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).default(1),
})

// GET /api/cart — current user's cart
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: parseInt(session.user.id) },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'asc' },
    })

    const items = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      stock: item.product.stock,
    }))
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST /api/cart — add or increment item
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = addToCartSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { productId, quantity } = parsed.data
    const userId = parseInt(session.user.id)

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 409 })
    }

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    })

    let cartItem
    if (existing) {
      cartItem = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { product: true },
      })
    } else {
      cartItem = await prisma.cartItem.create({
        data: { userId, productId, quantity, price: product.price },
        include: { product: true },
      })
    }

    return NextResponse.json(cartItem, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

// DELETE /api/cart — clear entire cart
export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.cartItem.deleteMany({ where: { userId: parseInt(session.user.id) } })
    return NextResponse.json({ message: 'Cart cleared' })
  } catch {
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
  }
}
