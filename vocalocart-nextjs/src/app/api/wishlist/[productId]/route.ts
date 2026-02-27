import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// DELETE /api/wishlist/[productId] — remove product from wishlist
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId } = await params
    const userId = parseInt(session.user.id)

    await prisma.wishlistItem.deleteMany({
      where: { userId, productId: parseInt(productId) },
    })

    return NextResponse.json({ message: 'Removed from wishlist' })
  } catch {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
