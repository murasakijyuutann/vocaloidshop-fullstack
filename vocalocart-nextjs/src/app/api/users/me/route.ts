import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  birthday: z.string().optional(),
})

// GET /api/users/me
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        birthday: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PATCH /api/users/me
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { birthday, ...rest } = parsed.data

    const user = await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: {
        ...rest,
        ...(birthday !== undefined ? { birthday: birthday ? new Date(birthday) : null } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        birthday: true,
        isAdmin: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
