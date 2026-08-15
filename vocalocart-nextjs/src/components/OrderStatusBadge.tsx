import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_META, type OrderStatus } from '@/lib/order-status'

/**
 * Tonal, icon-led status badge — replaces the seven differently-hued pastel
 * pills (one per status) with a single restrained style. Only the terminal
 * states get emphasis: canceled uses the destructive token, delivered uses
 * full foreground contrast.
 */
export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = ORDER_STATUS_META[status]
  if (!meta) {
    return (
      <Badge variant="outline" className={cn('text-muted-foreground', className)}>
        {status}
      </Badge>
    )
  }

  const Icon = meta.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1',
        status === 'CANCELED' && 'border-destructive/30 text-destructive',
        status === 'DELIVERED' && 'text-foreground',
        status !== 'CANCELED' && status !== 'DELIVERED' && 'text-muted-foreground',
        className
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2} />
      {meta.label}
    </Badge>
  )
}
