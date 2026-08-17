'use client'
import { useEffect, useState } from 'react'
import { useFormatter, useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Mail, Phone, Cake, CalendarDays, Pencil, Package, MapPin, Heart, Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/PageHeader'

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
  const t = useTranslations('MyPage')
  const format = useFormatter()
  const { status } = useSession()
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
        toast.success(t('profileUpdated'))
      } else {
        toast.error(data.error ?? t('updateFailed'))
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-8 h-9 w-40" />
        <Skeleton className="mb-6 h-28 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }
  if (!profile) return null

  const details = [
    { label: t('labelEmail'), value: profile.email, icon: Mail },
    { label: t('labelPhone'), value: profile.phone ?? '—', icon: Phone },
    { label: t('labelBirthday'), value: profile.birthday ? format.dateTime(new Date(profile.birthday)) : '—', icon: Cake },
    { label: t('labelMemberSince'), value: format.dateTime(new Date(profile.createdAt), { year: 'numeric', month: 'long' }), icon: CalendarDays },
  ]

  const quickLinks = [
    { href: '/orders', icon: Package, label: t('myOrders') },
    { href: '/addresses', icon: MapPin, label: t('addresses') },
    { href: '/wishlist', icon: Heart, label: t('wishlist') },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 page-enter">
      <PageHeader title={t('title')} />

      <div className="mb-6 flex items-center gap-5 rounded-lg border border-border bg-surface p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          {profile.isAdmin && (
            <Badge variant="outline" className="mt-1.5 gap-1 text-muted-foreground">
              <ShieldCheck className="h-3 w-3" strokeWidth={2} />
              {t('admin')}
            </Badge>
          )}
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-surface p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{t('profileDetails')}</h2>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" strokeWidth={2} />
              {t('edit')}
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">{t('fullName')}</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('phone')} <span className="font-normal text-muted-foreground">{t('optional')}</span>
              </label>
              <Input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('birthday')} <span className="font-normal text-muted-foreground">{t('optional')}</span>
              </label>
              <Input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
                {saving ? t('saving') : t('save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4 text-sm">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <dt className="flex w-36 shrink-0 items-center gap-2 font-medium text-muted-foreground">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {label}
                </dt>
                <dd className="text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {quickLinks.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-4 text-center transition-colors hover:border-muted-foreground/40"
          >
            <Icon className="h-6 w-6 text-secondary" strokeWidth={1.5} />
            <p className="text-sm font-medium text-foreground">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
