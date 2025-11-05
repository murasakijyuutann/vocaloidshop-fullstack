import React from "react";
import styled from "styled-components";
import { PageTransition } from "../components/PageTransition";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../hooks/useToast";

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem 3rem;
  animation: fadeInUp 0.5s ease;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ItemCount = styled.span`
  font-size: 1.2rem;
  color: #718096;
  font-weight: 400;
`;

const ContinueShoppingLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  padding: 0.75rem 1.25rem;
  border: 2px solid #667eea;
  border-radius: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
  }
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const CartItems = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
`;

const CartItem = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 80px 1fr;
    gap: 1rem;
  }
`;

const ItemImage = styled.div<{ $imageUrl?: string }>`
  width: 120px;
  height: 120px;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
`;

const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ItemName = styled(Link)`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #667eea;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ItemPrice = styled.div`
  font-size: 1.1rem;
  color: #667eea;
  font-weight: 600;
`;

const ItemActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-end;

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
`;

const QuantityButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: #f7fafc;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const QuantityDisplay = styled.div`
  width: 50px;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  border-left: 1px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #f56565;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: #c53030;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ItemSubtotal = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  text-align: right;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const OrderSummary = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  position: sticky;
  top: 2rem;

  @media (max-width: 968px) {
    position: static;
  }
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const SummaryRow = styled.div<{ $highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-size: ${props => props.$highlight ? '1.3rem' : '1rem'};
  font-weight: ${props => props.$highlight ? '700' : '400'};
  color: ${props => props.$highlight ? '#2d3748' : '#4a5568'};
  border-top: ${props => props.$highlight ? '2px solid #e2e8f0' : 'none'};
  margin-top: ${props => props.$highlight ? '1rem' : '0'};
  padding-top: ${props => props.$highlight ? '1.5rem' : '0.75rem'};
`;

const CheckoutButton = styled.button`
  width: 100%;
  padding: 1.2rem;
  margin-top: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TrustBadges = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #718096;

  span:first-child {
    font-size: 1.2rem;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);

  h2 {
    font-size: 2.5rem;
    color: #2d3748;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: #718096;
    margin-bottom: 2rem;
  }

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;

    h2 {
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

const EmptyCartImage = styled.div`
  font-size: 8rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
`;

const ShopNowButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }
`;

const ClearCartButton = styled.button`
  background: none;
  border: 1px solid #e2e8f0;
  color: #718096;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    border-color: #f56565;
    color: #f56565;
    background: #fff5f5;
  }
`;

const CartPage: React.FC = () => {
  const { cart, removeFromCart, removeAllFromCart, addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleRemoveOne = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId);
      toast("Removed one item", "success");
    } catch (error) {
      toast("Failed to remove item", "error");
    }
  };

  const handleAddOne = async (productId: number) => {
    if (!user) {
      toast("Please log in to modify cart", "info");
      navigate("/login");
      return;
    }
    try {
      await addToCart(productId, 1);
      toast("Added one more", "success");
    } catch (error) {
      toast("Failed to add item", "error");
    }
  };

  const handleRemoveAll = async (cartItemId: number, productName: string) => {
    if (window.confirm(`Remove all "${productName}" from cart?`)) {
      try {
        await removeAllFromCart(cartItemId);
        toast("Removed from cart", "success");
      } catch (error) {
        toast("Failed to remove item", "error");
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Clear entire cart? This cannot be undone.")) {
      try {
        for (const item of cart) {
          await removeAllFromCart(item.cartItemId);
        }
        toast("Cart cleared", "success");
      } catch (error) {
        toast("Failed to clear cart", "error");
      }
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast("Please log in to checkout", "info");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  // Empty cart state
  if (cart.length === 0) {
    return (
      <PageTransition>
        <Wrapper>
          <EmptyCart>
            <EmptyCartImage>🛒</EmptyCartImage>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <ShopNowButton to="/">
              🎵 Start Shopping
            </ShopNowButton>
          </EmptyCart>
        </Wrapper>
      </PageTransition>
    );
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const shipping = subtotal >= 5000 ? 0 : 500; // Free shipping over ¥5,000
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <PageTransition>
      <Wrapper>
        <Header>
          <div>
            <Title>
              🛒 Shopping Cart
              <ItemCount>({cart.length} {cart.length === 1 ? 'item' : 'items'})</ItemCount>
            </Title>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <ClearCartButton onClick={handleClearCart}>
              🗑️ Clear Cart
            </ClearCartButton>
            <ContinueShoppingLink to="/">
              ← Continue Shopping
            </ContinueShoppingLink>
          </div>
        </Header>

        <CartLayout>
          {/* Cart Items */}
          <CartItems>
            {cart.map(item => (
              <CartItem key={item.cartItemId}>
                <ItemImage $imageUrl={item.imageUrl}>
                  {!item.imageUrl && '🎵'}
                </ItemImage>

                <ItemInfo>
                  <ItemName to={`/product/${item.productId}`}>
                    {item.productName}
                  </ItemName>
                  <ItemPrice>¥{item.price.toLocaleString()} each</ItemPrice>
                </ItemInfo>

                <ItemActions>
                  <QuantityControl>
                    <QuantityButton 
                      onClick={() => handleRemoveOne(item.cartItemId)}
                      disabled={item.quantity <= 1}
                      title="Remove one"
                    >
                      −
                    </QuantityButton>
                    <QuantityDisplay>{item.quantity}</QuantityDisplay>
                    <QuantityButton 
                      onClick={() => handleAddOne(item.productId)}
                      title="Add one"
                    >
                      +
                    </QuantityButton>
                  </QuantityControl>

                  <ItemSubtotal>
                    ¥{item.totalPrice.toLocaleString()}
                  </ItemSubtotal>

                  <RemoveButton 
                    onClick={() => handleRemoveAll(item.cartItemId, item.productName)}
                  >
                    🗑️ Remove
                  </RemoveButton>
                </ItemActions>
              </CartItem>
            ))}
          </CartItems>

          {/* Order Summary */}
          <OrderSummary>
            <SummaryTitle>Order Summary</SummaryTitle>

            <SummaryRow>
              <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
              <span>¥{subtotal.toLocaleString()}</span>
            </SummaryRow>

            <SummaryRow>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `¥${shipping.toLocaleString()}`}</span>
            </SummaryRow>

            {subtotal < 5000 && shipping > 0 && (
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#667eea', 
                marginTop: '0.5rem',
                padding: '0.75rem',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '8px'
              }}>
                💡 Add ¥{(5000 - subtotal).toLocaleString()} more for free shipping!
              </div>
            )}

            <SummaryRow>
              <span>Tax (10%)</span>
              <span>¥{tax.toLocaleString()}</span>
            </SummaryRow>

            <SummaryRow $highlight>
              <span>Total</span>
              <span>¥{total.toLocaleString()}</span>
            </SummaryRow>

            <CheckoutButton onClick={handleCheckout}>
              Proceed to Checkout 💳
            </CheckoutButton>

            <TrustBadges>
              <TrustBadge>
                <span>🔒</span>
                <span>Secure payment</span>
              </TrustBadge>
              <TrustBadge>
                <span>🚚</span>
                <span>Fast delivery</span>
              </TrustBadge>
              <TrustBadge>
                <span>↩️</span>
                <span>Easy returns</span>
              </TrustBadge>
              <TrustBadge>
                <span>✅</span>
                <span>Authentic products</span>
              </TrustBadge>
            </TrustBadges>
          </OrderSummary>
        </CartLayout>
      </Wrapper>
    </PageTransition>
  );
};

export default CartPage;