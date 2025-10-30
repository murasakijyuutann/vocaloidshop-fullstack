import axios from "axios";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface CartItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

interface CartContextType {
  cart: CartItem[];
  fetchCart: () => void;
  addToCart: (productId: number, quantity: number) => void;
  removeFromCart: (cartItemId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const userId = 1; // temporary

  const fetchCart = async () => {
    const res = await axios.get(`/api/cart/${userId}`);
    setCart(res.data);
  };

  const addToCart = async (productId: number, quantity: number) => {
    await axios.post("/api/cart", { userId, productId, quantity });
    await fetchCart();
  };

  const removeFromCart = async (cartItemId: number) => {
  console.log("Deleting cartItemId:", cartItemId);
  await axios.delete(`/api/cart/${cartItemId}`);
  await fetchCart();
};

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cart, fetchCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
