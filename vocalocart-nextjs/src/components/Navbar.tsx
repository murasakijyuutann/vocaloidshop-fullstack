'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Home,
  Heart,
  Mail,
  ShoppingCart,
  Package,
  User,
  Settings,
  Store,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/contact', label: 'Contact', icon: Mail },
]

export default function Navbar() {
  const { data: session } = useSession()
  const totalItems = useCart(s => s.totalItems)
  const fetchCart = useCart(s => s.fetchCart)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close the mobile menu when the route changes. Adjusted directly during
  // render (React's documented pattern for resetting state when a prop
  // changes) rather than in an effect, since a plain effect would run an
  // extra commit after every navigation just to flip this flag back off.
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (session) fetchCart()
  }, [session, fetchCart])

  const cartCount = totalItems()
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href))

  const navLinkClass = (href: string) =>
    cn(
      'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
      isActive(href)
        ? 'text-secondary'
        : 'text-muted-foreground hover:bg-surface hover:text-foreground'
    )

  const mobileLinkClass = (href: string) =>
    cn(
      'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
      isActive(href) ? 'text-secondary' : 'text-foreground hover:bg-surface'
    )

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
          VocaloCart
        </Link>

        <div className="hidden md:flex md:items-center md:gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={navLinkClass(href)}>
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </Link>
          ))}

          {session ? (
            <>
              <Link href="/cart" className={cn(navLinkClass('/cart'), 'relative')}>
                <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/orders" className={navLinkClass('/orders')}>
                <Package className="h-4 w-4" strokeWidth={2} />
                Orders
              </Link>
              <Link href="/my" className={navLinkClass('/my')}>
                <User className="h-4 w-4" strokeWidth={2} />
                {session.user?.name?.split(' ')[0]}
              </Link>

              {session.user?.isAdmin && (
                <div className="ml-1 flex items-center gap-1 border-l border-border pl-2">
                  <Link href="/admin/orders" className={navLinkClass('/admin/orders')}>
                    <Settings className="h-4 w-4" strokeWidth={2} />
                    Orders
                  </Link>
                  <Link href="/admin/products" className={navLinkClass('/admin/products')}>
                    <Store className="h-4 w-4" strokeWidth={2} />
                    Products
                  </Link>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="ml-2" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {menuOpen && (
        <div className="divide-y divide-border border-t border-border md:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={mobileLinkClass(href)}>
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </Link>
          ))}

          {session ? (
            <>
              <Link href="/cart" className={mobileLinkClass('/cart')}>
                <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                Cart
                {cartCount > 0 && (
                  <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/orders" className={mobileLinkClass('/orders')}>
                <Package className="h-4 w-4" strokeWidth={2} />
                Orders
              </Link>
              <Link href="/my" className={mobileLinkClass('/my')}>
                <User className="h-4 w-4" strokeWidth={2} />
                My Page
              </Link>
              {session.user?.isAdmin && (
                <>
                  <Link href="/admin/orders" className={mobileLinkClass('/admin/orders')}>
                    <Settings className="h-4 w-4" strokeWidth={2} />
                    Admin · Orders
                  </Link>
                  <Link href="/admin/products" className={mobileLinkClass('/admin/products')}>
                    <Store className="h-4 w-4" strokeWidth={2} />
                    Admin · Products
                  </Link>
                </>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={mobileLinkClass('/login')}>
                Login
              </Link>
              <Link href="/register" className={mobileLinkClass('/register')}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
