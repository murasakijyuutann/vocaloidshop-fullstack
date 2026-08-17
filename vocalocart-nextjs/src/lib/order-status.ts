import { CreditCard, Cog, Package, PackageCheck, Truck, CheckCircle2, XCircle, type LucideIcon } from 'lucide-react'
import en from '../../messages/en.json'

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

export const ORDER_STATUS_META: Record<OrderStatus, { icon: LucideIcon }> = {
  PAYMENT_RECEIVED: { icon: CreditCard },
  PROCESSING: { icon: Cog },
  PREPARING: { icon: Package },
  READY_FOR_DELIVERY: { icon: PackageCheck },
  IN_DELIVERY: { icon: Truck },
  DELIVERED: { icon: CheckCircle2 },
  CANCELED: { icon: XCircle },
}

// Admin pages are intentionally excluded from translation (see the i18n plan's
// D2), so they read labels from here instead of `useTranslations`, keeping
// their copy in English regardless of the active locale.
export const ORDER_STATUS_LABELS_EN: Record<OrderStatus, string> = en.OrderStatus
