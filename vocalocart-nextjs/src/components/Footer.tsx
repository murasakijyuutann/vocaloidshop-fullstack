import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-3 text-lg font-bold tracking-tight text-foreground">VocaloCart</h3>
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for Vocaloid merchandise.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
              Shop
            </h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-foreground">
                Products
              </Link>
              <Link href="/wishlist" className="transition-colors hover:text-foreground">
                Wishlist
              </Link>
              <Link href="/cart" className="transition-colors hover:text-foreground">
                Cart
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
              Account
            </h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/my" className="transition-colors hover:text-foreground">
                My Page
              </Link>
              <Link href="/orders" className="transition-colors hover:text-foreground">
                Orders
              </Link>
              <Link href="/addresses" className="transition-colors hover:text-foreground">
                Addresses
              </Link>
              <Link href="/contact" className="transition-colors hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} VocaloCart. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
