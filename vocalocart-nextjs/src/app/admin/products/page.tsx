'use client'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ClipboardList, Plus, X, Upload, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'
import { cn } from '@/lib/utils'

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
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-8 h-9 w-56" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 page-enter">
      <PageHeader
        title="Products"
        description={`${products.length} products`}
        actions={
          <>
            <Button variant="outline" onClick={() => router.push('/admin/orders')}>
              <ClipboardList className="h-4 w-4" strokeWidth={2} />
              Orders
            </Button>
            <Button onClick={() => { setShowForm(s => !s); setEditId(null); setForm(emptyForm) }}>
              {showForm && !editId ? <X className="h-4 w-4" strokeWidth={2} /> : <Plus className="h-4 w-4" strokeWidth={2} />}
              {showForm && !editId ? 'Cancel' : 'Add Product'}
            </Button>
          </>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-5 text-lg font-bold text-foreground">{editId ? 'Edit Product' : 'New Product'}</h2>
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-foreground">Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Price (¥) *</label>
              <Input type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 3000" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Stock *</label>
              <Input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="e.g. 50" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Category *</label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Image</label>
              <div className="flex gap-2">
                <Input
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://... or upload →"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Upload className="h-4 w-4" strokeWidth={2} />}
                  Upload
                </Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
              {form.imageUrl && (
                <Image
                  src={form.imageUrl}
                  alt="preview"
                  width={80}
                  height={80}
                  className="mt-2 h-20 w-20 rounded-md border border-border object-cover"
                />
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Optional description…"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
              {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Stock</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(p => (
              <tr key={p.id} className="transition-colors hover:bg-accent">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground/40">VC</span>
                      )}
                    </div>
                    <div>
                      <p className="max-w-50 truncate font-medium text-foreground">{p.name}</p>
                      <p className="max-w-50 truncate text-xs text-muted-foreground">{p.description ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-secondary">¥{p.price.toLocaleString('en-US')}</td>
                <td className="px-4 py-3 text-right">
                  <span className={cn('font-medium', p.stock === 0 ? 'text-destructive' : p.stock < 5 ? 'text-foreground' : 'text-muted-foreground')}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(p.id, p.name)}>
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="py-16 text-center text-muted-foreground">No products yet. Add your first one above.</div>
        )}
      </div>
    </div>
  )
}
