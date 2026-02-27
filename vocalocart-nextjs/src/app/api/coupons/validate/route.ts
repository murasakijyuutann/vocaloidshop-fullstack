import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  code: z.string().min(1),
  orderAmount: z.number().int().min(0),
})

// POST /api/coupons/validate
// Validates a coupon code against the given order amount.
// Returns discount amount and coupon details if valid.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { code, orderAmount } = parsed.data
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

    if (!coupon) {
      return NextResponse.json({ valid: false, error: 'Coupon not found' }, { status: 404 })
    }
    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: 'Coupon is no longer active' })
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: 'Coupon has expired' })
    }
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'Coupon usage limit reached' })
    }
    if (coupon.minOrderAmount !== null && orderAmount < coupon.minOrderAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount is ¥${coupon.minOrderAmount.toLocaleString()}`,
      })
    }

    const discount = coupon.type === 'PERCENTAGE'
      ? Math.floor(orderAmount * (coupon.value / 100))
      : Math.min(coupon.value, orderAmount)

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discount,
    })
  } catch (error) {
    console.error('coupon validate error:', error)
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
