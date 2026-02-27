import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// PATCH /api/addresses/[id]/default — set as default address
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const userId = parseInt(session.user.id)

    const address = await prisma.address.findUnique({ where: { id: parseInt(id) } })
    if (!address || address.userId !== userId) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
      prisma.address.update({ where: { id: parseInt(id) }, data: { isDefault: true } }),
    ])

    return NextResponse.json({ message: 'Default address updated' })
  } catch {
    return NextResponse.json({ error: 'Failed to set default address' }, { status: 500 })
  }
}
