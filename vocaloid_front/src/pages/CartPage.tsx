import React from "react";
import styled from "styled-components";
import { PageTransition } from "../components/PageTransition";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 2rem auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  animation: fadeInUp 0.4s ease;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  h1 {
    color: ${({ theme }) => theme.colors.primary};
    text-align: center;
  }

  button {
    margin-right: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: 0.3s;
    background: ${({ theme }) => theme.colors.primary};
    color: white;

    &:hover {
      background: ${({ theme }) => theme.colors.accent};
      transform: scale(1.05);
    }
  }
`;

const Item = styled.div`
  border-bottom: 1px solid #e0e0e0;
  padding: 1rem 0;

  h3 {
    color: ${({ theme }) => theme.colors.text};
  }

  &:last-child {
    border-bottom: none;
  }
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
      <PageTransition>
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
      <button onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
            </Container>
        </PageTransition>
  );
};

export default CartPage;
