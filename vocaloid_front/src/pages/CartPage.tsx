import React from "react";
import styled from "styled-components";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  padding: 2rem;
`;

const Item = styled.div`
  border-bottom: 1px solid #ccc;
  padding: 1rem 0;
`;

const CartPage: React.FC = () => {
  const { cart, removeFromCart, removeAllFromCart, addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return <Container>Your cart is empty 😢</Container>;
  }

  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <Container>
      <h1>🛒 Your Cart</h1>
      {cart.map(item => (
        <Item key={item.cartItemId}>
          <h3>{item.productName}</h3>
          <p>¥{item.price} × {item.quantity}</p>
          <div>
            <button onClick={() => removeFromCart(item.cartItemId)}>− Remove one</button>
            <button
              onClick={() => {
                          if (!user) {
                    alert("Please log in to add items to your cart.");
                  navigate("/login");
                  return;
                }
                addToCart(item.productId, 1);
              }}
            >
              + Add one
            </button>
            <button onClick={() => removeAllFromCart(item.cartItemId)}>🗑 Remove all</button>
          </div>
        </Item>
      ))}
      <h2>Total: ¥{total}</h2>
    </Container>
  );
};

export default CartPage;
