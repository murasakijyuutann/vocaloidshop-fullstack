import { createContext } from "react";

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface CartContextType {
  cart: CartItem[];
  fetchCart: () => void;
  addToCart: (productId: number, quantity: number) => void;
  removeFromCart: (cartItemId: number) => void; // decrement by 1
  removeAllFromCart: (cartItemId: number) => void; // delete item entirely
}

export const CartContext = createContext<CartContextType | undefined>(undefined);
