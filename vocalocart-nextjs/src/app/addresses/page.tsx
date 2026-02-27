'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Address {
  id: number
  recipientName: string
  line1: string
  line2?: string | null
  city: string
  state?: string | null
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

const EMPTY = { recipientName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'Japan', phone: '', isDefault: false }

export default function AddressesPage() {
  const { status } = useSession()
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') reload()
  }, [status, router])

  const reload = () => {
    fetch('/api/addresses').then(r => r.ok ? r.json() : null).then(d => setAddresses(d?.addresses ?? [])).finally(() => setLoading(false))
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (a: Address) => {
    setEditing(a)
    setForm({ recipientName: a.recipientName, line1: a.line1, line2: a.line2 ?? '', city: a.city, state: a.state ?? '', postalCode: a.postalCode, country: a.country, phone: a.phone, isDefault: a.isDefault })
    setShowForm(true)
  }

  const handleSave = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSaving(true)
    try {
      const body = { ...form, line2: form.line2 || undefined, state: form.state || undefined }
      const res = editing
        ? await fetch(`/api/addresses/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        toast.success(editing ? 'Address updated!' : 'Address added! 🏠')
        setShowForm(false)
        reload()
      } else {
        const d = await res.json()
        toast.error(d.error ?? 'Failed to save address')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this address?')) return
    const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Address deleted'); reload() }
    else toast.error('Failed to delete')
  }

  const handleSetDefault = async (id: number) => {
    const res = await fetch(`/api/addresses/${id}/default`, { method: 'PATCH' })
    if (res.ok) { toast.success('Default address updated'); reload() }
  }

  const f = (k: keyof typeof EMPTY, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  if (loading) return <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🏠 Addresses</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-md hover:-translate-y-0.5 transition-all text-sm"
        >
          + Add Address
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">{editing ? '✏️ Edit Address' : '+ New Address'}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'recipientName', label: 'Recipient Name', required: true, col: 'sm:col-span-2' },
              { key: 'line1', label: 'Address Line 1', required: true, col: 'sm:col-span-2' },
              { key: 'line2', label: 'Address Line 2 (optional)', required: false, col: 'sm:col-span-2' },
              { key: 'city', label: 'City', required: true },
              { key: 'state', label: 'State / Province (optional)', required: false },
              { key: 'postalCode', label: 'Postal Code', required: true },
              { key: 'country', label: 'Country', required: true },
              { key: 'phone', label: 'Phone', required: true },
            ].map(({ key, label, required, col }) => (
              <div key={key} className={col ?? ''}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key as keyof typeof EMPTY] as string}
                  onChange={e => f(key as keyof typeof EMPTY, e.target.value)}
                  required={required}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
                />
              </div>
            ))}
            <div className="sm:col-span-2 flex items-center gap-2">
              <input id="default" type="checkbox" checked={form.isDefault} onChange={e => f('isDefault', e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              <label htmlFor="default" className="text-sm font-semibold text-gray-700 cursor-pointer">Set as default address</label>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-70 text-sm">
                {saving ? '⏳ Saving…' : '✅ Save'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Address list */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md text-center py-16 px-6">
          <p className="text-5xl mb-4">🏠</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No addresses saved</h2>
          <p className="text-gray-500">Add an address to speed up checkout.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className={`bg-white rounded-2xl shadow-md p-5 border-2 ${addr.isDefault ? 'border-indigo-400' : 'border-transparent'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">{addr.recipientName}</span>
                    {addr.isDefault && <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full">Default</span>}
                  </div>
                  <p className="text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p className="text-gray-600">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                  <p className="text-gray-600">{addr.country} · {addr.phone}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-xs px-3 py-1.5 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 font-semibold transition-colors">Set default</button>
                  )}
                  <button onClick={() => openEdit(addr)} className="text-xs px-3 py-1.5 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold transition-colors">✏️ Edit</button>
                  <button onClick={() => handleDelete(addr.id)} className="text-xs px-3 py-1.5 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 font-semibold transition-colors">🗑️ Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
