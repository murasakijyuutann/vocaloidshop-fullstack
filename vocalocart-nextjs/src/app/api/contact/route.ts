import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

const resend = new Resend(process.env.RESEND_API_KEY)

// POST /api/contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, subject, message } = parsed.data
    const supportEmail = process.env.SUPPORT_EMAIL ?? 'support@vocalocart.com'
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@vocalocart.com'

    // Forward to support
    await resend.emails.send({
      from: fromEmail,
      to: supportEmail,
      subject: `Contact Form: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    })

    // Confirmation to sender
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'We received your message — VocaloCart',
      text: `Dear ${name},\n\nThank you for contacting us. We'll get back to you soon.\n\nBest regards,\nVocaloCart Team`,
    })

    return NextResponse.json({ message: 'Message sent successfully' })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
