import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { CartContext } from "./CartContextBase";
import type { CartItem } from "./CartContextBase";
import { useAuth } from "../hooks/useAuth";

// CartContext is defined in CartContextBase to satisfy Fast Refresh constraints

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const userId = user?.id;

  const fetchCart = useCallback(async () => {
    if (!userId) return;
    const res = await axios.get(`/api/cart/${userId}`);
    setCart(res.data);
  }, [userId]);

  const addToCart = async (productId: number, quantity: number) => {
    if (!userId) {
      alert("Please log in to add items to your cart.");
      return;
    }
    await axios.post("/api/cart", { userId, productId, quantity });
    await fetchCart();
  };

  const removeFromCart = async (cartItemId: number) => {
    // Decrease quantity by one; if quantity becomes 0, backend will delete it
    await axios.patch(`/api/cart/${cartItemId}/decrement`);
    await fetchCart();
  };

  const removeAllFromCart = async (cartItemId: number) => {
    await axios.delete(`/api/cart/${cartItemId}`);
    await fetchCart();
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, removeFromCart, removeAllFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

