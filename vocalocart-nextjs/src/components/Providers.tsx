'use client'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

// VocaloCart ships a single dark theme (see docs/vocalocart-design-brief.md) —
// no light/system theme or user-facing toggle exists, so it's forced here
// rather than left half-wired.
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
