import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { OrderStatus } from '@prisma/client'

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
})

// PATCH /api/admin/orders/[id] — update order status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateStatusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(id) } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const updated = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: parsed.data.status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: true } },
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}
