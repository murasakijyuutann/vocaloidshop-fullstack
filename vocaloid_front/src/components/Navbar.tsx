import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";

const Nav = styled.nav`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem 0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s ease;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 968px) {
    display: none;
  }
`;

const NavItem = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CartLink = styled(NavItem)`
  position: relative;
`;

const CartBadge = styled.span`
  background: #ff4757;
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(255, 71, 87, 0.4);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
`;

const UserName = styled.div`
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 1200px) {
    display: none;
  }
`;

const Button = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: white;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 968px) {
    display: flex;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 968px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`;

const MobileNavItem = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  &:active {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const MobileButton = styled.button`
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &:active {
    background: rgba(255, 255, 255, 0.4);
  }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0.5rem 0;
`;

export const Navbar: React.FC = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <Nav>
      <Container>
        <Logo to="/" onClick={closeMobileMenu}>
          🎵 VocaloCart
        </Logo>

        {/* Desktop Navigation */}
        <DesktopNav>
          <NavItem to="/contact">📞 Contact</NavItem>
          
          <CartLink to="/cart">
            🛒 Cart
            {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
          </CartLink>

          {user ? (
            <>
              <NavItem to="/orders">📦 Orders</NavItem>
              <UserMenu>
                <NavItem to="/mypage">👤 Profile</NavItem>
                <UserName>
                  <span>👋</span>
                  <span>{user.name}</span>
                </UserName>
                <Button onClick={handleLogout}>Logout</Button>
              </UserMenu>
            </>
          ) : (
            <UserMenu>
              <NavItem to="/register">✨ Register</NavItem>
              <Button as={Link} to="/login">🔐 Login</Button>
            </UserMenu>
          )}
        </DesktopNav>

        {/* Mobile Menu Button */}
        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </MobileMenuButton>
      </Container>

      {/* Mobile Navigation */}
      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileNavItem to="/contact" onClick={closeMobileMenu}>
          <span>📞 Contact</span>
        </MobileNavItem>

        <MobileNavItem to="/cart" onClick={closeMobileMenu}>
          <span>🛒 Cart</span>
          {itemCount > 0 && <CartBadge>{itemCount}</CartBadge>}
        </MobileNavItem>

        {user ? (
          <>
            <Divider />
            <MobileNavItem to="/orders" onClick={closeMobileMenu}>
              <span>📦 Orders</span>
            </MobileNavItem>
            <MobileNavItem to="/mypage" onClick={closeMobileMenu}>
              <span>👤 Profile ({user.name})</span>
            </MobileNavItem>
            <MobileButton onClick={handleLogout}>
              🚪 Logout
            </MobileButton>
          </>
        ) : (
          <>
            <Divider />
            <MobileNavItem to="/register" onClick={closeMobileMenu}>
              <span>✨ Register</span>
            </MobileNavItem>
            <MobileButton as={Link} to="/login" onClick={closeMobileMenu}>
              🔐 Login
            </MobileButton>
          </>
        )}
      </MobileMenu>
    </Nav>
  );
};