import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="font-bold text-lg mb-3">🎵 VocaloCart</h3>
            <p className="text-white/80 text-sm">Your ultimate destination for Vocaloid merchandise.</p>
          </div>
          <div>
            <h3 className="font-bold mb-3">Shop</h3>
            <div className="flex flex-col gap-1 text-sm text-white/80">
              <Link href="/" className="hover:text-white transition-colors">Products</Link>
              <Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link>
              <Link href="/cart" className="hover:text-white transition-colors">Cart</Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-3">Account</h3>
            <div className="flex flex-col gap-1 text-sm text-white/80">
              <Link href="/my" className="hover:text-white transition-colors">My Page</Link>
              <Link href="/orders" className="hover:text-white transition-colors">Orders</Link>
              <Link href="/addresses" className="hover:text-white transition-colors">Addresses</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-4 text-center text-sm text-white/70">
          © {new Date().getFullYear()} VocaloCart. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
