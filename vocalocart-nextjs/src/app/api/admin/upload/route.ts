import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'

// POST /api/admin/upload
// Accepts a multipart/form-data request with a "file" field.
// Uploads to Vercel Blob and returns the public URL.
// Admin only.
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
        { status: 415 }
      )
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 4 MB' }, { status: 413 })
    }

    const filename = `products/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, '_')}`
    const blob = await put(filename, file, { access: 'public' })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
