import { cn } from "@/lib/utils"

/**
 * Price emphasis is one of the three sanctioned uses of the teal secondary
 * accent (see docs/vocalocart-design-brief.md) — active nav state, focus
 * rings, and this.
 */
export function PriceTag({
  value,
  className,
  size = "default",
}: {
  value: number
  className?: string
  size?: "sm" | "default" | "lg"
}) {
  return (
    <span
      className={cn(
        "font-bold text-secondary",
        size === "sm" && "text-sm",
        size === "default" && "text-lg",
        size === "lg" && "text-2xl",
        className
      )}
    >
      ¥{value.toLocaleString()}
    </span>
  )
}
