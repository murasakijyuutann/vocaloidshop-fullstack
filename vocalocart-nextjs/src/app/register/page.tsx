'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', birthday: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined, birthday: form.birthday || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Account created! Please sign in 🎉')
        router.push('/login')
      } else {
        if (res.status === 409) setErrors({ email: 'Email already registered' })
        else toast.error(data.error ?? 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthColors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-400']
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong']

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">✨</div>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 mt-1">Join VocaloCart today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Hatsune Miku"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">⚠️ {errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="miku@vocaloid.jp"
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">⚠️ {errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="At least 8 characters"
                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500">
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {[1,2,3].map(i => (
                  <div key={i} className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full transition-all ${i <= pwStrength ? strengthColors[pwStrength] : ''}`} />
                  </div>
                ))}
                <span className="text-xs text-gray-500">{strengthLabels[pwStrength]}</span>
              </div>
            )}
            {errors.password && <p className="text-red-500 text-xs mt-1">⚠️ {errors.password}</p>}
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Phone <span className="font-normal text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">optional</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+81 90-0000-0000"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>
          </div>

          {/* Birthday (optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Birthday <span className="font-normal text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-full">optional</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🎂</span>
              <input
                type="date"
                value={form.birthday}
                onChange={e => set('birthday', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none text-base mt-2"
          >
            {loading ? '⏳ Creating account…' : '✨ Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold hover:text-purple-600 transition-colors">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
