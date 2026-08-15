import { beforeEach, describe, expect, it } from 'vitest'
import { useCart, type CartItem } from './use-cart'

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 1,
    productId: 1,
    quantity: 1,
    price: 1000,
    name: 'Test item',
    stock: 10,
    ...overrides,
  }
}

// The store is a module-level zustand singleton, so state is reset between
// tests to keep them independent of run order.
beforeEach(() => {
  useCart.setState({ items: [], loading: false })
})

describe('useCart totals', () => {
  it('are zero for an empty cart', () => {
    expect(useCart.getState().totalItems()).toBe(0)
    expect(useCart.getState().totalPrice()).toBe(0)
  })

  it('sum quantities across all line items', () => {
    useCart.setState({
      items: [
        makeItem({ id: 1, quantity: 2 }),
        makeItem({ id: 2, quantity: 3 }),
      ],
    })
    expect(useCart.getState().totalItems()).toBe(5)
  })

  it('sums price * quantity across all line items', () => {
    useCart.setState({
      items: [
        makeItem({ id: 1, price: 1500, quantity: 2 }), // 3000
        makeItem({ id: 2, price: 800, quantity: 1 }), // 800
      ],
    })
    expect(useCart.getState().totalPrice()).toBe(3800)
  })
})
