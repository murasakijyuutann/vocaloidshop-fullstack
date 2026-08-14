import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

/**
 * Typographic empty state: heading + one line + one action. Replaces the
 * emoji (😢 etc.) empty states across the app — see design brief.
 */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-border bg-surface px-6 py-16 text-center">
      {Icon && <Icon className="mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />}
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
