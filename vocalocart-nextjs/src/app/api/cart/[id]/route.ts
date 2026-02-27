import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const updateSchema = z.object({
  quantity: z.number().int().min(0),
})

// PATCH /api/cart/[id] — update quantity (0 = remove)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.findUnique({ where: { id: parseInt(id) } })
    if (!cartItem) return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    if (cartItem.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (parsed.data.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: parseInt(id) } })
      return NextResponse.json({ message: 'Item removed' })
    }

    const updated = await prisma.cartItem.update({
      where: { id: parseInt(id) },
      data: { quantity: parsed.data.quantity },
      include: { product: true },
    })
    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 })
  }
}

// DELETE /api/cart/[id] — remove specific item
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const cartItem = await prisma.cartItem.findUnique({ where: { id: parseInt(id) } })
    if (!cartItem) return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    if (cartItem.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.cartItem.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ message: 'Item removed' })
  } catch {
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 })
  }
}
