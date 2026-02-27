import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const updateSchema = z.object({
  recipientName: z.string().min(1).optional(),
  line1: z.string().min(1).optional(),
  line2: z.string().optional(),
  city: z.string().min(1).optional(),
  state: z.string().optional(),
  postalCode: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
})

async function getOwnedAddress(userId: number, id: number) {
  const address = await prisma.address.findUnique({ where: { id } })
  if (!address || address.userId !== userId) return null
  return address
}

// PUT /api/addresses/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const address = await getOwnedAddress(parseInt(session.user.id), parseInt(id))
    if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updated = await prisma.address.update({
      where: { id: parseInt(id) },
      data: parsed.data,
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

// DELETE /api/addresses/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const address = await getOwnedAddress(parseInt(session.user.id), parseInt(id))
    if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 404 })

    await prisma.address.delete({ where: { id: parseInt(id) } })

    // If the deleted address was default, promote the most recent remaining one
    if (address.isDefault) {
      const next = await prisma.address.findFirst({
        where: { userId: parseInt(session.user.id) },
        orderBy: { createdAt: 'desc' },
      })
      if (next) {
        await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } })
      }
    }

    return NextResponse.json({ message: 'Address deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}
