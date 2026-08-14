'use client'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  className?: string
}

export function QuantityStepper({ value, min = 1, max, onChange, className }: QuantityStepperProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center overflow-hidden rounded-md border border-input',
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus className="h-4 w-4" strokeWidth={2} />
      </button>
      <span className="w-10 text-center text-sm font-medium text-foreground">{value}</span>
      <button
        type="button"
        onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}
        disabled={max !== undefined && value >= max}
        aria-label="Increase quantity"
        className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  )
}
