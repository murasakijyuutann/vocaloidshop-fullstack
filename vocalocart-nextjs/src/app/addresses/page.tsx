'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, CheckCircle2, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { cn } from '@/lib/utils'

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

const FIELDS: { key: keyof typeof EMPTY; label: string; required: boolean; col?: string }[] = [
  { key: 'recipientName', label: 'Recipient Name', required: true, col: 'sm:col-span-2' },
  { key: 'line1', label: 'Address Line 1', required: true, col: 'sm:col-span-2' },
  { key: 'line2', label: 'Address Line 2 (optional)', required: false, col: 'sm:col-span-2' },
  { key: 'city', label: 'City', required: true },
  { key: 'state', label: 'State / Province (optional)', required: false },
  { key: 'postalCode', label: 'Postal Code', required: true },
  { key: 'country', label: 'Country', required: true },
  { key: 'phone', label: 'Phone', required: true },
]

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
        toast.success(editing ? 'Address updated' : 'Address added')
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 page-enter">
      <PageHeader
        title="Addresses"
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add Address
          </Button>
        }
      />

      {showForm && (
        <div className="mb-6 rounded-lg border border-border bg-surface p-6">
          <h2 className="mb-5 text-lg font-bold text-foreground">{editing ? 'Edit Address' : 'New Address'}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map(({ key, label, required, col }) => (
              <div key={key} className={col ?? ''}>
                <label htmlFor={`address-${key}`} className="mb-1 block text-sm font-medium text-foreground">{label}</label>
                <Input
                  id={`address-${key}`}
                  type="text"
                  value={form[key] as string}
                  onChange={e => f(key, e.target.value)}
                  required={required}
                />
              </div>
            ))}
            <div className="flex items-center gap-2 sm:col-span-2">
              <input id="default" type="checkbox" checked={form.isDefault} onChange={e => f('isDefault', e.target.checked)} className="h-4 w-4 accent-primary" />
              <label htmlFor="default" className="cursor-pointer text-sm font-medium text-foreground">Set as default address</label>
            </div>
            <div className="flex gap-3 pt-2 sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState icon={MapPin} title="No addresses saved" description="Add an address to speed up checkout." />
      ) : (
        <div className="space-y-4">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className={cn(
                'rounded-lg border bg-surface p-5',
                addr.isDefault ? 'border-primary/60' : 'border-border'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-bold text-foreground">{addr.recipientName}</span>
                    {addr.isDefault && <Badge variant="outline" className="text-muted-foreground">Default</Badge>}
                  </div>
                  <p className="text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                  <p className="text-muted-foreground">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode}</p>
                  <p className="text-muted-foreground">{addr.country} · {addr.phone}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  {!addr.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(addr.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Set default
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openEdit(addr)}>
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(addr.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
