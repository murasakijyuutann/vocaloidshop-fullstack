import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/orders/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { orderItems: { include: { product: true } } },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    // Users can only see their own orders; admins can see all
    if (order.userId !== parseInt(session.user.id) && !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] — cancel own order
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const cancellableStatuses = ['PAYMENT_RECEIVED', 'PROCESSING']
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: 'Order cannot be cancelled at this stage' },
        { status: 409 }
      )
    }

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: 'CANCELED' },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
  }
}
