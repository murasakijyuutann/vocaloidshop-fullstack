'use client'
import { create } from 'zustand'

export interface CartItem {
  id: number
  productId: number
  quantity: number
  price: number
  name: string
  imageUrl?: string | null
  stock: number
}

interface CartStore {
  items: CartItem[]
  loading: boolean
  fetchCart: () => Promise<void>
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>
  removeItem: (cartItemId: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: () => number
  totalPrice: () => number
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  loading: false,

  fetchCart: async () => {
    set({ loading: true })
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        set({ items: data.items ?? [] })
      }
    } finally {
      set({ loading: false })
    }
  },

  addItem: async (productId, quantity = 1) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    })
    if (res.ok) await get().fetchCart()
    else {
      const err = await res.json()
      throw new Error(err.error ?? 'Failed to add to cart')
    }
  },

  updateQuantity: async (cartItemId, quantity) => {
    const res = await fetch(`/api/cart/${cartItemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    })
    if (res.ok) {
      set(state => ({
        items: state.items.map(i =>
          i.id === cartItemId ? { ...i, quantity } : i
        ),
      }))
    }
  },

  removeItem: async (cartItemId) => {
    await fetch(`/api/cart/${cartItemId}`, { method: 'DELETE' })
    set(state => ({ items: state.items.filter(i => i.id !== cartItemId) }))
  },

  clearCart: async () => {
    await fetch('/api/cart', { method: 'DELETE' })
    set({ items: [] })
  },

  totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  totalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
}))
