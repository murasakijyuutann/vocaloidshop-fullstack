'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/hooks/use-cart'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const totalItems = useCart(s => s.totalItems)
  const fetchCart = useCart(s => s.fetchCart)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (session) fetchCart()
  }, [session, fetchCart])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const cartCount = totalItems()

  return (
    <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-white font-bold text-xl flex items-center gap-2 hover:scale-105 transition-transform">
          🎵 VocaloCart
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="text-white font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
            🏠 Home
          </Link>
          <Link href="/wishlist" className="text-white font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
            ❤️ Wishlist
          </Link>
          <Link href="/contact" className="text-white font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
            📬 Contact
          </Link>

          {session ? (
            <>
              <Link href="/cart" className="relative text-white font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-1">
                🛒 Cart
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/orders" className="text-white font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
                📦 Orders
              </Link>
              <Link href="/my" className="text-white font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">
                👤 {session.user?.name?.split(' ')[0]}
              </Link>
              {session.user?.isAdmin && (
                <>
                  <Link href="/admin/orders" className="text-white font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">⚙️ Orders</Link>
                  <Link href="/admin/products" className="text-white font-semibold px-4 py-2 rounded-xl hover:bg-white/20 transition-colors">🛍️ Products</Link>
                </>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="ml-2 px-4 py-2 bg-white/20 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 bg-white/20 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition-all">
                Login
              </Link>
              <Link href="/register" className="ml-1 px-4 py-2 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-all">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl text-white text-xl hover:bg-white/30 transition-colors"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-gradient-to-b from-indigo-600 to-purple-700 border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          <Link href="/" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">🏠 Home</Link>
          <Link href="/wishlist" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">❤️ Wishlist</Link>
          <Link href="/contact" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">📬 Contact</Link>
          {session ? (
            <>
              <Link href="/cart" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20 flex items-center gap-2">
                🛒 Cart {cartCount > 0 && <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">{cartCount}</span>}
              </Link>
              <Link href="/orders" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">📦 Orders</Link>
              <Link href="/my" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">👤 My Page</Link>
              {session.user?.isAdmin && (
                <>
                  <Link href="/admin/orders" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">⚙️ Orders</Link>
                  <Link href="/admin/products" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">🛍️ Products</Link>
                </>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })} className="text-left text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">Login</Link>
              <Link href="/register" className="text-white font-semibold px-4 py-3 rounded-xl hover:bg-white/20">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
