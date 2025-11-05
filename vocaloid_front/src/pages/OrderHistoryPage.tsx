import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { PageTransition } from "../components/PageTransition";

const PageBackground = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
`;

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  animation: fadeInUp 0.5s ease;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  color: white;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
`;

const OrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OrderId = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
`;

const OrderDate = styled.div`
  font-size: 0.9rem;
  color: #718096;
`;

const StatusBadge = styled.div<{ $status?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  background: ${props => {
    switch(props.$status) {
      case 'PAYMENT_RECEIVED': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'PROCESSING': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      case 'PREPARING': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      case 'READY_FOR_DELIVERY': return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      case 'IN_DELIVERY': return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
      case 'DELIVERED': return 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)';
      case 'CANCELED': return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
      default: return '#e2e8f0';
    }
  }};
  color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }
`;

const ProgressTracker = styled.div`
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 12px;
`;

const ProgressTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 1rem;
`;

const ProgressSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 5%;
    right: 5%;
    height: 2px;
    background: #e2e8f0;
    transform: translateY(-50%);
    z-index: 0;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem;
  }
`;

const ProgressStep = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    &:nth-child(n+4) {
      display: none;
    }
  }
`;

const StepCircle = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 40px;
  height: 40px;
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
  font-size: 1rem;
  font-weight: 700;
  box-shadow: ${props => props.$active || props.$completed ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'};

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }
`;

const StepLabel = styled.div<{ $active: boolean }>`
  font-size: 0.75rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#2d3748' : '#a0aec0'};
  text-align: center;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.65rem;
  }
`;

const OrderItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const OrderItem = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 12px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 60px 1fr;
    gap: 0.75rem;
  }
`;

const ItemImage = styled.div<{ $imageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
`;

const ItemDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ItemName = styled(Link)`
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #667eea;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ItemMeta = styled.div`
  font-size: 0.9rem;
  color: #718096;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ItemPrice = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #667eea;
  text-align: right;

  @media (max-width: 768px) {
    grid-column: 1 / -1;
    text-align: left;
    padding-left: 0.75rem;
  }
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TotalAmount = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;

  span {
    color: #718096;
    font-weight: 400;
    font-size: 1rem;
    margin-right: 0.5rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    
    button, a {
      flex: 1;
    }
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover {
      background: #667eea;
      color: white;
    }
  `}

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
    justify-content: center;
  }
`;

const ShippingInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #edf2f7;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.6;

  strong {
    color: #2d3748;
    display: block;
    margin-bottom: 0.5rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
`;

const EmptyTitle = styled.h2`
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 3rem;
  color: white;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

interface OrderItemDTO {
  id: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

interface OrderDTO {
  id: number;
  orderedAt: string;
  totalAmount: number;
  items: OrderItemDTO[];
  status?: string;
  shipRecipientName?: string;
  shipLine1?: string;
  shipLine2?: string;
  shipCity?: string;
  shipState?: string;
  shipPostalCode?: string;
  shipCountry?: string;
  shipPhone?: string;
}

const steps = [
  { key: 'PAYMENT_RECEIVED', label: 'Payment', icon: '💳' },
  { key: 'PROCESSING', label: 'Processing', icon: '⚙️' },
  { key: 'PREPARING', label: 'Preparing', icon: '📦' },
  { key: 'READY_FOR_DELIVERY', label: 'Ready', icon: '✅' },
  { key: 'IN_DELIVERY', label: 'Shipping', icon: '🚚' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉' }
];

const statusIndex = (code?: string): number => {
  if (!code) return -1;
  const index = steps.findIndex(s => s.key === code);
  return index >= 0 ? index : -1;
};

const readableStatus = (code?: string): string => {
  if (!code) return 'Unknown';
  const step = steps.find(s => s.key === code);
  return step ? step.label : code.replace(/_/g, ' ');
};

const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const { data } = await axios.get<OrderDTO[]>(`/api/orders/user/${user.id}`);
        setOrders(data);
      } catch (error) {
        toast("Failed to load orders", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate, toast]);

  const handleReorder = async (order: OrderDTO) => {
    if (!user) return;
    try {
      for (const item of order.items) {
        await axios.post('/api/cart', {
          userId: user.id,
          productId: item.productId,
          quantity: item.quantity
        });
      }
      toast("✅ Items added to cart!", "success");
      navigate("/cart");
    } catch (error) {
      toast("Failed to add items to cart", "error");
    }
  };

  const handleTrackOrder = (orderId: number) => {
    // Placeholder for tracking functionality
    toast(`Tracking order #${orderId}...`, "info");
  };

  if (!user) return null;

  if (loading) {
    return (
      <PageTransition>
        <PageBackground>
          <Wrapper>
            <LoadingSpinner>⏳</LoadingSpinner>
          </Wrapper>
        </PageBackground>
      </PageTransition>
    );
  }

  if (orders.length === 0) {
    return (
      <PageTransition>
        <PageBackground>
          <Wrapper>
            <EmptyState>
              <EmptyIcon>📦</EmptyIcon>
              <EmptyTitle>No Orders Yet</EmptyTitle>
              <EmptyText>Start shopping to see your order history here!</EmptyText>
              <ShopButton to="/">
                🛍️ Start Shopping
              </ShopButton>
            </EmptyState>
          </Wrapper>
        </PageBackground>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageBackground>
        <Wrapper>
          <Header>
            <Title>
              📦 Order History
            </Title>
            <Subtitle>Track and manage your orders</Subtitle>
          </Header>

          <OrdersContainer>
            {orders.map(order => {
              const currentStatusIndex = statusIndex(order.status);
              const isCanceled = order.status === 'CANCELED';

              return (
                <OrderCard key={order.id}>
                  <OrderHeader>
                    <OrderInfo>
                      <OrderId>Order #{order.id}</OrderId>
                      <OrderDate>
                        {new Date(order.orderedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </OrderDate>
                    </OrderInfo>
                    <StatusBadge $status={order.status}>
                      {steps[currentStatusIndex]?.icon || '📋'} {readableStatus(order.status)}
                    </StatusBadge>
                  </OrderHeader>

                  {!isCanceled && order.status && (
                    <ProgressTracker>
                      <ProgressTitle>Order Progress</ProgressTitle>
                      <ProgressSteps>
                        {steps.map((step, idx) => (
                          <ProgressStep
                            key={step.key}
                            $active={idx === currentStatusIndex}
                            $completed={idx < currentStatusIndex}
                          >
                            <StepCircle
                              $active={idx === currentStatusIndex}
                              $completed={idx < currentStatusIndex}
                            >
                              {idx < currentStatusIndex ? '✓' : step.icon}
                            </StepCircle>
                            <StepLabel $active={idx === currentStatusIndex}>
                              {step.label}
                            </StepLabel>
                          </ProgressStep>
                        ))}
                      </ProgressSteps>
                    </ProgressTracker>
                  )}

                  <OrderItems>
                    {order.items.map(item => (
                      <OrderItem key={item.id}>
                        <ItemImage $imageUrl={undefined}>
                          🎵
                        </ItemImage>
                        <ItemDetails>
                          <ItemName to={`/product/${item.productId}`}>
                            {item.productName}
                          </ItemName>
                          <ItemMeta>
                            Qty: {item.quantity} × ¥{item.price.toLocaleString()}
                          </ItemMeta>
                        </ItemDetails>
                        <ItemPrice>
                          ¥{(item.price * item.quantity).toLocaleString()}
                        </ItemPrice>
                      </OrderItem>
                    ))}
                  </OrderItems>

                  {order.shipRecipientName && (
                    <ShippingInfo>
                      <strong>📍 Shipping Address:</strong>
                      {order.shipRecipientName}<br />
                      {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ''}<br />
                      {order.shipCity} {order.shipPostalCode}, {order.shipCountry}<br />
                      📞 {order.shipPhone}
                    </ShippingInfo>
                  )}

                  <OrderFooter>
                    <TotalAmount>
                      <span>Total:</span>
                      ¥{order.totalAmount.toLocaleString()}
                    </TotalAmount>
                    <ActionButtons>
                      {!isCanceled && order.status !== 'DELIVERED' && (
                        <Button
                          $variant="primary"
                          onClick={() => handleTrackOrder(order.id)}
                        >
                          🚚 Track Order
                        </Button>
                      )}
                      <Button
                        $variant="secondary"
                        onClick={() => handleReorder(order)}
                      >
                        🔄 Reorder
                      </Button>
                    </ActionButtons>
                  </OrderFooter>
                </OrderCard>
              );
            })}
          </OrdersContainer>
        </Wrapper>
      </PageBackground>
    </PageTransition>
  );
};

export default OrderHistoryPage;