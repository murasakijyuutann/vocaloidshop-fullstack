import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PriceTag } from "@/components/PriceTag"

export interface ProductCardProduct {
  id: number
  name: string
  price: number
  imageUrl?: string | null
  stock: number
  category?: { name: string } | null
}

interface ProductCardProps {
  product: ProductCardProduct
  onAddToCart: (productId: number) => void
  /** Optional icon button in the top-right corner of the image (e.g. wishlist add/remove). */
  cornerAction?: {
    icon: LucideIcon
    label: string
    onClick: (productId: number) => void
  }
}

/**
 * Shared product card — used by the home grid and wishlist grid so the card
 * shape stays identical everywhere (see design brief: "consistent card shape
 * across the grid").
 */
export function ProductCard({ product, onAddToCart, cornerAction }: ProductCardProps) {
  const outOfStock = product.stock === 0

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-muted-foreground/40">
      <div className="relative aspect-square bg-muted">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-2xl font-bold tracking-tight text-muted-foreground/40">
              VC
            </span>
          </div>
        )}

        {cornerAction && (
          <button
            type="button"
            onClick={() => cornerAction.onClick(product.id)}
            aria-label={cornerAction.label}
            title={cornerAction.label}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
          >
            <cornerAction.icon className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.category && (
          <Badge variant="outline" className="w-fit text-muted-foreground">
            {product.category.name}
          </Badge>
        )}

        <Link
          href={`/product/${product.id}`}
          className="line-clamp-2 flex-1 text-sm font-medium text-foreground transition-colors hover:text-secondary"
        >
          {product.name}
        </Link>

        <PriceTag value={product.price} className="mt-1" />

        <Button
          type="button"
          size="sm"
          className="mt-1 w-full"
          disabled={outOfStock}
          onClick={() => onAddToCart(product.id)}
        >
          {outOfStock ? (
            "Out of stock"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" strokeWidth={2} />
              Add to cart
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
