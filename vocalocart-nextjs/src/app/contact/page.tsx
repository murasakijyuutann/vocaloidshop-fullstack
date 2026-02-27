'use client'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSent(true)
        toast.success('Message sent! We\'ll be in touch soon 📬')
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to send message')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white text-center py-10 px-6 mb-8 shadow-lg">
        <div className="text-5xl mb-3">📬</div>
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-white/90">We'd love to hear from you! Send us a message and we'll respond within 24 hours.</p>
      </div>

      {sent ? (
        <div className="bg-white rounded-2xl shadow-md text-center py-16 px-6">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h2>
          <p className="text-gray-500 mb-6">Thank you for reaching out. We'll get back to you soon.</p>
          <button
            onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    required
                    placeholder="Hatsune Miku"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    required
                    placeholder="miku@vocaloid.jp"
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📝</span>
                <input
                  type="text"
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  required
                  placeholder="Order inquiry, feedback, or anything else"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
              <textarea
                value={form.message}
                onChange={e => set('message', e.target.value)}
                required
                rows={6}
                placeholder="Tell us how we can help you…"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.message.length} characters</p>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-base flex items-center justify-center gap-2"
            >
              {sending ? '⏳ Sending…' : '🚀 Send Message'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
