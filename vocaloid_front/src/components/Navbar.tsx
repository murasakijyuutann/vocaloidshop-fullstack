import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.primary};
  padding: 1rem 2rem;
  color: white;
  font-weight: 500;

  a {
    color: white;
    text-decoration: none;
    font-weight: 600;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.85;
    }
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  button {
    background: ${({ theme }) => theme.colors.accent};
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }
`;

const Logo = styled(Link)`
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
`;

export const Navbar: React.FC = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Nav>
      <Logo to="/">🎵 VocaloCart</Logo>

      <Right>
        <Link to="/cart">🛒 Cart ({itemCount})</Link>

        {user ? (
          <>
            <Link to="/orders">📦 Orders</Link>
            <span>{user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </Right>
    </Nav>
  );
};
