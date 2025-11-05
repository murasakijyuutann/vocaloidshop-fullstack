import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { PageTransition } from "../components/PageTransition";

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

const Title = styled.h1`
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 3rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 10%;
    right: 10%;
    height: 2px;
    background: #e2e8f0;
    z-index: 0;
    transform: translateY(-50%);
  }

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 2rem;

    &::before {
      left: 5%;
      right: 5%;
    }
  }
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 1;
  position: relative;

  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const StepCircle = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => 
    props.$completed ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' :
    props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
    '#e2e8f0'
  };
  color: ${props => props.$active || props.$completed ? 'white' : '#a0aec0'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  box-shadow: ${props => props.$active || props.$completed ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`;

const StepLabel = styled.div<{ $active: boolean }>`
  font-size: 0.9rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#2d3748' : '#a0aec0'};
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const CheckoutLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddressOption = styled.div<{ $selected: boolean }>`
  border: 2px solid ${props => props.$selected ? '#667eea' : '#e2e8f0'};
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$selected ? 'rgba(102, 126, 234, 0.05)' : 'white'};
  position: relative;

  &:hover {
    border-color: #667eea;
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const AddressLabel = styled.label`
  display: flex;
  align-items: start;
  gap: 1rem;
  cursor: pointer;
  width: 100%;

  input[type="radio"] {
    margin-top: 0.25rem;
    cursor: pointer;
    width: 18px;
    height: 18px;
    accent-color: #667eea;
  }
`;

const AddressDetails = styled.div`
  flex: 1;

  strong {
    display: block;
    font-size: 1.1rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  p {
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
  }
`;

const DefaultBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const ManageAddressButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: #f7fafc;
  border: 2px dashed #cbd5e0;
  border-radius: 10px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #edf2f7;
    border-color: #667eea;
  }
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const PaymentMethod = styled.div<{ $selected: boolean }>`
  border: 2px solid ${props => props.$selected ? '#667eea' : '#e2e8f0'};
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  background: ${props => props.$selected ? 'rgba(102, 126, 234, 0.05)' : 'white'};

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
  }

  .icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .label {
    font-size: 0.9rem;
    font-weight: 600;
    color: #2d3748;
  }
`;

const PromoSection = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PromoInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const PromoButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #764ba2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OrderSummary = styled(Card)`
  position: sticky;
  top: 2rem;

  @media (max-width: 968px) {
    position: static;
  }
`;

const SummaryItem = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:last-of-type {
    border-bottom: none;
  }
`;

const ItemImage = styled.div<{ $imageUrl?: string }>`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;

  .name {
    font-size: 0.95rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .quantity {
    font-size: 0.85rem;
    color: #718096;
  }
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
`;

const SummaryRow = styled.div<{ $highlight?: boolean; $success?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-size: ${props => props.$highlight ? '1.3rem' : '1rem'};
  font-weight: ${props => props.$highlight ? '700' : '400'};
  color: ${props => props.$success ? '#48bb78' : props.$highlight ? '#2d3748' : '#4a5568'};
  border-top: ${props => props.$highlight ? '2px solid #e2e8f0' : 'none'};
  margin-top: ${props => props.$highlight ? '1rem' : '0'};
  padding-top: ${props => props.$highlight ? '1.5rem' : '0.75rem'};
`;

const PlaceOrderButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 1.2rem;
  margin-top: 1.5rem;
  background: ${props => props.$loading 
    ? '#a0aec0' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }

  &:disabled {
    opacity: 0.6;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const TrustSignals = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.5rem;
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
    font-size: 2rem;
    color: #2d3748;
    margin-bottom: 1rem;
  }

  p {
    color: #718096;
    margin-bottom: 2rem;
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

interface Address {
  id: number;
  recipientName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const CheckoutPage: React.FC = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "">("");
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  // Calculate totals
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.totalPrice, 0), [cart]);
  const shipping = subtotal >= 5000 ? 0 : 500;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shipping + tax - discount;

  // Load addresses
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get<Address[]>(`/api/addresses/${user.id}`);
        setAddresses(data);
        const defaultAddr = data.find(a => a.isDefault);
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      } catch (e) {
        // Silent fail - user can still checkout without saved address
      }
    };
    loadAddresses();
  }, [user]);

  const applyPromoCode = () => {
    // Mock promo code logic
    if (promoCode.toUpperCase() === "VOCALOID10") {
      setDiscount(Math.round(subtotal * 0.1));
      setPromoApplied(true);
      toast("Promo code applied! 10% off 🎉", "success");
    } else {
      toast("Invalid promo code", "error");
    }
  };

  const placeOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (currentStep < 3) {
      toast("Please complete all steps", "info");
      return;
    }

    setPlacing(true);
    try {
      const qs = selectedAddressId ? `?addressId=${selectedAddressId}` : "";
      await axios.post(`/api/orders/place/${user.id}${qs}`);
      await fetchCart();
      
      // Success!
      toast("✅ Order placed successfully!", "success");
      
      // Redirect to order history after short delay
      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (err: unknown) {
      let msg = "Failed to place order";
      if (typeof err === "object" && err !== null) {
        const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
        msg = anyErr.response?.data?.message || anyErr.message || msg;
      }
      toast(msg, "error");
    } finally {
      setPlacing(false);
    }
  };

  // Empty cart check
  if (cart.length === 0) {
    return (
      <PageTransition>
        <Wrapper>
          <EmptyCart>
            <h2>Your cart is empty</h2>
            <p>Add some items before checking out!</p>
            <BackButton onClick={() => navigate("/")}>
              ← Back to Shop
            </BackButton>
          </EmptyCart>
        </Wrapper>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Wrapper>
        <Title>💳 Checkout</Title>

        {/* Progress Steps */}
        <ProgressBar>
          <Step $active={currentStep === 1} $completed={currentStep > 1}>
            <StepCircle $active={currentStep === 1} $completed={currentStep > 1}>
              {currentStep > 1 ? '✓' : '1'}
            </StepCircle>
            <StepLabel $active={currentStep === 1}>Shipping</StepLabel>
          </Step>

          <Step $active={currentStep === 2} $completed={currentStep > 2}>
            <StepCircle $active={currentStep === 2} $completed={currentStep > 2}>
              {currentStep > 2 ? '✓' : '2'}
            </StepCircle>
            <StepLabel $active={currentStep === 2}>Payment</StepLabel>
          </Step>

          <Step $active={currentStep === 3} $completed={false}>
            <StepCircle $active={currentStep === 3} $completed={false}>
              3
            </StepCircle>
            <StepLabel $active={currentStep === 3}>Review</StepLabel>
          </Step>
        </ProgressBar>

        <CheckoutLayout>
          <MainSection>
            {/* Step 1: Shipping Address */}
            <Card>
              <CardTitle>📍 Shipping Address</CardTitle>
              
              {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <p style={{ color: '#718096', marginBottom: '1rem' }}>
                    No saved addresses. You can add one now or ship to a new address.
                  </p>
                  <ManageAddressButton onClick={() => navigate("/addresses")}>
                    + Add New Address
                  </ManageAddressButton>
                </div>
              ) : (
                <>
                  {addresses.map(addr => (
                    <AddressOption 
                      key={addr.id}
                      $selected={selectedAddressId === addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        if (currentStep === 1) setCurrentStep(2);
                      }}
                    >
                      <AddressLabel>
                        <input 
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => {
                            setSelectedAddressId(addr.id);
                            if (currentStep === 1) setCurrentStep(2);
                          }}
                        />
                        <AddressDetails>
                          <strong>
                            {addr.recipientName}
                            {addr.isDefault && <DefaultBadge>Default</DefaultBadge>}
                          </strong>
                          <p>
                            {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                            {addr.city} {addr.postalCode}, {addr.country}<br />
                            📞 {addr.phone}
                          </p>
                        </AddressDetails>
                      </AddressLabel>
                    </AddressOption>
                  ))}
                  <ManageAddressButton onClick={() => navigate("/addresses")}>
                    + Add New Address or Manage Existing
                  </ManageAddressButton>
                </>
              )}
            </Card>

            {/* Step 2: Payment Method */}
            <Card>
              <CardTitle>💳 Payment Method</CardTitle>
              <PaymentMethods>
                <PaymentMethod 
                  $selected={selectedPayment === "card"}
                  onClick={() => {
                    setSelectedPayment("card");
                    if (currentStep === 2) setCurrentStep(3);
                  }}
                >
                  <div className="icon">💳</div>
                  <div className="label">Credit Card</div>
                </PaymentMethod>

                <PaymentMethod 
                  $selected={selectedPayment === "paypal"}
                  onClick={() => {
                    setSelectedPayment("paypal");
                    if (currentStep === 2) setCurrentStep(3);
                  }}
                >
                  <div className="icon">🅿️</div>
                  <div className="label">PayPal</div>
                </PaymentMethod>

                <PaymentMethod 
                  $selected={selectedPayment === "cod"}
                  onClick={() => {
                    setSelectedPayment("cod");
                    if (currentStep === 2) setCurrentStep(3);
                  }}
                >
                  <div className="icon">💵</div>
                  <div className="label">Cash on Delivery</div>
                </PaymentMethod>
              </PaymentMethods>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f7fafc', borderRadius: '10px', fontSize: '0.9rem', color: '#718096' }}>
                💡 <strong>Note:</strong> Payment processing is not yet implemented in this demo. Your order will be placed without actual payment.
              </div>
            </Card>

            {/* Step 3: Promo Code */}
            <Card>
              <CardTitle>🎟️ Promo Code</CardTitle>
              <PromoSection>
                <PromoInput
                  placeholder="Enter promo code (try: VOCALOID10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <PromoButton 
                  onClick={applyPromoCode}
                  disabled={promoApplied || !promoCode}
                >
                  {promoApplied ? '✓ Applied' : 'Apply'}
                </PromoButton>
              </PromoSection>
            </Card>
          </MainSection>

          {/* Order Summary Sidebar */}
          <OrderSummary>
            <CardTitle>📦 Order Summary</CardTitle>

            {/* Cart Items */}
            {cart.map(item => (
              <SummaryItem key={item.cartItemId}>
                <ItemImage $imageUrl={item.imageUrl}>
                  {!item.imageUrl && '🎵'}
                </ItemImage>
                <ItemDetails>
                  <div className="name">{item.productName}</div>
                  <div className="quantity">Qty: {item.quantity}</div>
                </ItemDetails>
                <ItemPrice>¥{item.totalPrice.toLocaleString()}</ItemPrice>
              </SummaryItem>
            ))}

            {/* Pricing Breakdown */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e2e8f0' }}>
              <SummaryRow>
                <span>Subtotal</span>
                <span>¥{subtotal.toLocaleString()}</span>
              </SummaryRow>

              <SummaryRow>
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `¥${shipping.toLocaleString()}`}</span>
              </SummaryRow>

              {shipping > 0 && subtotal < 5000 && (
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

              {promoApplied && discount > 0 && (
                <SummaryRow $success>
                  <span>Discount</span>
                  <span>-¥{discount.toLocaleString()}</span>
                </SummaryRow>
              )}

              <SummaryRow $highlight>
                <span>Total</span>
                <span>¥{total.toLocaleString()}</span>
              </SummaryRow>
            </div>

            <PlaceOrderButton 
              onClick={placeOrder}
              disabled={placing || currentStep < 3}
              $loading={placing}
            >
              {placing ? (
                <>
                  <span>⏳</span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>✅</span>
                  <span>Place Order</span>
                </>
              )}
            </PlaceOrderButton>

            {currentStep < 3 && (
              <div style={{ 
                marginTop: '1rem', 
                textAlign: 'center', 
                fontSize: '0.9rem', 
                color: '#f56565',
                fontWeight: '600'
              }}>
                ⚠️ Complete all steps to place order
              </div>
            )}

            <TrustSignals>
              <TrustBadge>
                <span>🔒</span>
                <span>Secure checkout</span>
              </TrustBadge>
              <TrustBadge>
                <span>🛡️</span>
                <span>Buyer protection</span>
              </TrustBadge>
              <TrustBadge>
                <span>✅</span>
                <span>Money-back guarantee</span>
              </TrustBadge>
            </TrustSignals>
          </OrderSummary>
        </CheckoutLayout>
      </Wrapper>
    </PageTransition>
  );
};

export default CheckoutPage;