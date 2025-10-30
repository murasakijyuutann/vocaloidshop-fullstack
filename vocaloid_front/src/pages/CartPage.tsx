import React from "react";
import styled from "styled-components";
import { useCart } from "../context/CartContext";

const Container = styled.div`
  padding: 2rem;
`;

const Item = styled.div`
  border-bottom: 1px solid #ccc;
  padding: 1rem 0;
`;

const CartPage: React.FC = () => {
  const { cart, removeFromCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return <Container>Your cart is empty 😢</Container>;
  }

  return (
    <Container>
      <h1>🛍️ Your Cart</h1>
      {cart.map(item => (
  <Item key={item.cartItemId}>
    <h3>{item.productName}</h3>
    <p>¥{item.price} × {item.quantity}</p>
    <button onClick={() => removeFromCart(item.cartItemId)}>❌ Remove</button>
  </Item>
))}
      <h2>Total: ¥{total}</h2>
    </Container>
  );
};

export default CartPage;
