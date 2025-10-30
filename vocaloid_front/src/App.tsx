import React, { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { GlobalStyle } from "./styles/GlobalStyle";
import styled from "styled-components";
import { useAuth } from "./hooks/useAuth";
import { useCart } from "./hooks/useCart";
import { FiMenu, FiX, FiMoon, FiSun } from "react-icons/fi";
import { AnimatePresence } from "framer-motion";
import { useThemeMode } from "./hooks/useThemeMode";

const Header = styled.header`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
`;

const Nav = styled.nav<{ open: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;

  a {
    color: white;
    text-decoration: none;
    font-weight: 600;
    transition: 0.2s;

    &:hover {
      color: ${({ theme }) => theme.colors.accent};
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    background: ${({ theme }) => theme.colors.primary};
    position: absolute;
    top: 64px;
    right: 0;
    width: 100%;
    padding: 1rem 0;
    border-top: 2px solid ${({ theme }) => theme.colors.accent};
    max-height: ${({ open }) => (open ? "300px" : "0")};
    overflow: hidden;
    opacity: ${({ open }) => (open ? "1" : "0")};
  }
`;

const CartBadge = styled.span`
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  border-radius: 10px;
  padding: 0.1rem 0.5rem;
  font-size: 0.85rem;
  margin-left: 4px;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.6rem;
  display: none;
  cursor: pointer;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: block;
  }
`;

const ThemeToggle = styled.button`
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: white;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255,255,255,0.25);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    align-self: flex-end;
    margin-right: 1rem;
  }
`;

const App: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { mode, toggle } = useThemeMode();

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <>
      <GlobalStyle />
      <Header>
        <Title>🎵 VocaloCart</Title>

        <MenuButton onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </MenuButton>

        <Nav open={menuOpen}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            Cart
            {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
          </Link>

          <ThemeToggle
            aria-label="Toggle dark mode"
            onClick={() => { toggle(); setMenuOpen(false); }}
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {mode === 'dark' ? <FiSun /> : <FiMoon />}
            {mode === 'dark' ? 'Light' : 'Dark'}
          </ThemeToggle>

          {user ? (
            <>
              <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
              <Link to="/addresses" onClick={() => setMenuOpen(false)}>Addresses</Link>
              <Link to="/mypage" onClick={() => setMenuOpen(false)}>My Page</Link>
              <a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </Nav>
      </Header>
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
    </>
  );
};

export default App;
