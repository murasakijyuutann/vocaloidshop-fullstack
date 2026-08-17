'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { setLocaleCookie } from '@/i18n/actions'
import { locales, type Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'

const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ja: '日本語',
}

export default function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('Nav')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleSelect = (next: Locale) => {
    if (next === locale || isPending) return
    startTransition(async () => {
      await setLocaleCookie(next)
      router.refresh()
    })
  }

  return (
    <div
      role="group"
      aria-label={t('language')}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md border border-border bg-surface p-0.5',
        className
      )}
    >
      {locales.map(value => {
        const active = value === locale
        return (
          <button
            key={value}
            type="button"
            lang={value}
            aria-pressed={active}
            disabled={isPending}
            onClick={() => handleSelect(value)}
            className={cn(
              'rounded-sm px-2.5 py-1 text-sm font-medium transition-colors disabled:opacity-50',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {LOCALE_LABELS[value]}
          </button>
        )
      })}
    </div>
  )
}
