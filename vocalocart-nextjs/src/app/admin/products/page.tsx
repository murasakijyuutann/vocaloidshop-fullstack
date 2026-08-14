'use client'
import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Category { id: number; name: string }
interface Product {
  id: number
  name: string
  price: number
  stock: number
  imageUrl?: string | null
  description?: string | null
  categoryId: number
  category: { name: string }
}

const emptyForm = { name: '', description: '', price: '', stock: '', imageUrl: '', categoryId: '' }

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated') {
      if (!session?.user?.isAdmin) { router.push('/'); return }
      void loadData()
    }
  }, [status, session])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/products?size=100&sort=name&dir=asc'),
        fetch('/api/categories'),
      ])
      const [pData, cData] = await Promise.all([pRes.json(), cRes.json()])
      setProducts(pData.products ?? [])
      setCategories(cData.categories ?? [])
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        setForm(f => ({ ...f, imageUrl: data.url }))
        toast.success('Image uploaded')
      } else {
        toast.error(data.error ?? 'Upload failed')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.stock || !form.categoryId) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const url = editId ? `/api/products/${editId}` : '/api/products'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          price: parseInt(form.price),
          stock: parseInt(form.stock),
          imageUrl: form.imageUrl || undefined,
          categoryId: parseInt(form.categoryId),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(editId ? 'Product updated' : 'Product created')
        setForm(emptyForm)
        setEditId(null)
        setShowForm(false)
        void loadData()
      } else {
        toast.error(data.error ?? 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (p: Product) => {
    setEditId(p.id)
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      stock: String(p.stock),
      imageUrl: p.imageUrl ?? '',
      categoryId: String(p.categoryId),
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Product deleted')
      void loadData()
    } else {
      const d = await res.json()
      toast.error(d.error ?? 'Failed to delete')
    }
  }

  const handleCancel = () => {
    setEditId(null)
    setForm(emptyForm)
    setShowForm(false)
  }

  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-64 text-5xl animate-spin">⏳</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🛍️ Products</h1>
          <p className="text-gray-500 mt-1">{products.length} products</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push('/admin/orders')} className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-indigo-400 transition-all text-sm">
            📋 Orders
          </button>
          <button onClick={() => { setShowForm(s => !s); setEditId(null); setForm(emptyForm) }}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-md transition-all text-sm">
            {showForm && !editId ? '✕ Cancel' : '+ Add Product'}
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-5">{editId ? '✏️ Edit Product' : '➕ New Product'}</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Product name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (¥) *</label>
              <input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. 3000" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock *</label>
              <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. 50" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Image</label>
              <div className="flex gap-2">
                <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="https://... or upload →" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap">
                  {uploading ? '⏳' : '📁 Upload'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              {form.imageUrl && (
                <img src={form.imageUrl} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-gray-200" />
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Optional description…" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleCancel} className="px-5 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-400 transition-all">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-60">
              {saving ? '⏳ Saving…' : editId ? '✅ Update' : '➕ Create'}
            </button>
          </div>
        </form>
      )}

      {/* Products table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden shrink-0">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-lg">🎵</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-gray-400 text-xs truncate max-w-[200px]">{p.description ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{p.category.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">¥{p.price.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleEdit(p)} className="px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors">Edit</button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-16 text-gray-400">No products yet. Add your first one above.</div>
        )}
      </div>
    </div>
  )
}
