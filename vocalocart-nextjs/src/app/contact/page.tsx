'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { User, Mail, MessageSquare, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

const EMPTY = { name: '', email: '', subject: '', message: '' }

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (k: keyof typeof EMPTY, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSent(true)
        toast.success("Message sent — we'll be in touch soon")
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to send message')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 page-enter">
      <PageHeader
        title="Contact Us"
        description="We'd love to hear from you — send a message and we'll respond within 24 hours."
      />

      {sent ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface px-6 py-16 text-center">
          <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
          <h2 className="text-lg font-bold text-foreground">Message sent</h2>
          <p className="max-w-sm text-sm text-muted-foreground">Thank you for reaching out. We&apos;ll get back to you soon.</p>
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => { setSent(false); setForm(EMPTY) }}
          >
            Send another message
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Your Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
                  <Input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Hatsune Miku"
                    className={cn('pl-9', errors.name && 'border-destructive')}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" strokeWidth={2} />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="miku@vocaloid.jp"
                    className={cn('pl-9', errors.email && 'border-destructive')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" strokeWidth={2} />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Subject</label>
              <div className="relative">
                <MessageSquare className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
                <Input
                  type="text"
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  placeholder="Order inquiry, feedback, or anything else"
                  className={cn('pl-9', errors.subject && 'border-destructive')}
                />
              </div>
              {errors.subject && (
                <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" strokeWidth={2} />
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
              <Textarea
                value={form.message}
                onChange={e => set('message', e.target.value)}
                rows={6}
                placeholder="Tell us how we can help you…"
                className={cn('resize-none', errors.message && 'border-destructive')}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.message ? (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" strokeWidth={2} />
                    {errors.message}
                  </p>
                ) : <span />}
                <p className="text-xs text-muted-foreground">{form.message.length} characters</p>
              </div>
            </div>

            <Button type="submit" disabled={sending} className="w-full">
              {sending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
              {sending ? 'Sending…' : 'Send Message'}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
