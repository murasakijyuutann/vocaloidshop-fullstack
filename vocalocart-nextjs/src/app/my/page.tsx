'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

interface UserProfile {
  id: number
  name: string
  email: string
  phone?: string | null
  birthday?: string | null
  isAdmin: boolean
  createdAt: string
}

export default function MyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', birthday: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      fetch('/api/users/me').then(r => r.json()).then(d => {
        setProfile(d.user)
        setForm({ name: d.user.name ?? '', phone: d.user.phone ?? '', birthday: d.user.birthday ? d.user.birthday.split('T')[0] : '' })
      }).finally(() => setLoading(false))
    }
  }, [status, router])

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone || undefined, birthday: form.birthday || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(data.user)
        setEditing(false)
        toast.success('Profile updated! ✨')
      } else {
        toast.error(data.error ?? 'Failed to update profile')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>
  if (!profile) return null

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">👤 My Page</h1>

      {/* Avatar card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl shrink-0">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{profile.name}</h2>
          <p className="text-white/80 text-sm">{profile.email}</p>
          {profile.isAdmin && (
            <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold">⚙️ Admin</span>
          )}
        </div>
      </div>

      {/* Profile details / edit form */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Profile Details</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 border-2 border-indigo-500 text-indigo-600 font-semibold rounded-xl text-sm hover:bg-indigo-500 hover:text-white transition-all"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone <span className="font-normal text-gray-400">(optional)</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Birthday <span className="font-normal text-gray-400">(optional)</span></label>
              <input
                type="date"
                value={form.birthday}
                onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-70">
                {saving ? '⏳ Saving…' : '✅ Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4 text-sm">
            {[
              { label: '📧 Email', value: profile.email },
              { label: '📱 Phone', value: profile.phone ?? '—' },
              { label: '🎂 Birthday', value: profile.birthday ? new Date(profile.birthday).toLocaleDateString() : '—' },
              { label: '📅 Member since', value: new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-4">
                <dt className="w-36 font-semibold text-gray-700 shrink-0">{label}</dt>
                <dd className="text-gray-600">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/orders', emoji: '📦', label: 'My Orders' },
          { href: '/addresses', emoji: '🏠', label: 'Addresses' },
          { href: '/wishlist', emoji: '❤️', label: 'Wishlist' },
        ].map(({ href, emoji, label }) => (
          <Link key={href} href={href} className="bg-white rounded-2xl shadow-md p-4 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="text-3xl mb-2">{emoji}</div>
            <p className="font-semibold text-gray-700 text-sm">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
