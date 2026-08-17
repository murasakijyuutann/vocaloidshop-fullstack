'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { User, Mail, Lock, Phone, Cake, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const t = useTranslations('Register')
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
    if (!form.name.trim()) e.name = t('nameRequired')
    if (!form.email) e.email = t('emailRequired')
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = t('invalidEmail')
    if (form.password.length < 8) e.password = t('passwordTooShort')
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
        toast.success(t('accountCreated'))
        router.push('/login')
      } else {
        if (res.status === 409) setErrors({ email: t('emailAlreadyRegistered') })
        else toast.error(data.error ?? t('registrationFailed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthColors = ['', 'bg-destructive', 'bg-muted-foreground', 'bg-foreground']
  const strengthLabels = ['', t('strengthWeak'), t('strengthFair'), t('strengthStrong')]

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background p-4 py-10 page-enter">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-8 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            VC
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t('heading')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('subheading')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t('fullName')}</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
              <Input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder={t('namePlaceholder')}
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
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t('email')}</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
              <Input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder={t('emailPlaceholder')}
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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t('password')}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
              <Input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder={t('passwordPlaceholder')}
                className={cn('pl-9 pr-9', errors.password && 'border-destructive')}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? t('hidePassword') : t('showPassword')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" strokeWidth={2} /> : <Eye className="h-4 w-4" strokeWidth={2} />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn('h-full transition-all', i <= pwStrength && strengthColors[pwStrength])} />
                  </div>
                ))}
                <span className="text-xs text-muted-foreground">{strengthLabels[pwStrength]}</span>
              </div>
            )}
            {errors.password && (
              <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" strokeWidth={2} />
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
              {t('phone')} <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">{t('optional')}</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
              <Input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
              {t('birthday')} <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">{t('optional')}</span>
            </label>
            <div className="relative">
              <Cake className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={2} />
              <Input
                type="date"
                value={form.birthday}
                onChange={e => set('birthday', e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="mt-2 w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
            {loading ? t('creatingAccount') : t('createAccount')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t('haveAccount')}{' '}
          <Link href="/login" className="font-medium text-secondary hover:underline">
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
