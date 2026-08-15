import { CreditCard, Cog, Package, PackageCheck, Truck, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react'

export const ORDER_STATUSES = [
  'PAYMENT_RECEIVED',
  'PROCESSING',
  'PREPARING',
  'READY_FOR_DELIVERY',
  'IN_DELIVERY',
  'DELIVERED',
  'CANCELED',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; icon: LucideIcon }> = {
  PAYMENT_RECEIVED: { label: 'Payment Received', icon: CreditCard },
  PROCESSING: { label: 'Processing', icon: Cog },
  PREPARING: { label: 'Preparing', icon: Package },
  READY_FOR_DELIVERY: { label: 'Ready for Delivery', icon: PackageCheck },
  IN_DELIVERY: { label: 'In Delivery', icon: Truck },
  DELIVERED: { label: 'Delivered', icon: CheckCircle2 },
  CANCELED: { label: 'Canceled', icon: XCircle },
}
