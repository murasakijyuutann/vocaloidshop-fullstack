import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

const Wrapper = styled.div`
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  padding: 2rem 1.5rem;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2.5rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  p {
    font-size: 1rem;
    color: #718096;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const StatCard = styled.div<{ $color: string }>`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${({ $color }) => $color};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #718096;
    margin-bottom: 0.25rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }

  .stat-change {
    font-size: 0.875rem;
    color: #48bb78;
    font-weight: 500;
  }
`;

const ControlBar = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #2d3748;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 150px;

  &:hover {
    border-color: #cbd5e0;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const RefreshButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f7fafc;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const OrderInfo = styled.div`
  .order-id {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 0.25rem;
  }

  .order-date {
    font-size: 0.875rem;
    color: #718096;
  }

  .order-total {
    font-size: 1.125rem;
    font-weight: 600;
    color: #667eea;
    margin-top: 0.5rem;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
  
  ${({ $status }) => {
    switch ($status) {
      case 'PAYMENT_RECEIVED':
        return `background: #e6f4ea; color: #1e7e34;`;
      case 'PROCESSING':
        return `background: #fff3cd; color: #856404;`;
      case 'PREPARING':
        return `background: #cce5ff; color: #004085;`;
      case 'READY_FOR_DELIVERY':
        return `background: #d1ecf1; color: #0c5460;`;
      case 'IN_DELIVERY':
        return `background: #e2e3e5; color: #383d41;`;
      case 'DELIVERED':
        return `background: #d4edda; color: #155724;`;
      case 'CANCELED':
        return `background: #f8d7da; color: #721c24;`;
      default:
        return `background: #e2e8f0; color: #4a5568;`;
    }
  }}
`;

const ItemsList = styled.div`
  margin: 1rem 0;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f7fafc;
  
  &:last-child {
    border-bottom: none;
  }

  .item-name {
    font-weight: 500;
    color: #2d3748;
  }

  .item-details {
    color: #718096;
    font-size: 0.875rem;
  }
`;

const OrderActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #f7fafc;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StatusSelect = styled.select`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #2d3748;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e0;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

  .emoji {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  p {
    color: #718096;
    font-size: 1rem;
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  .spinner {
    font-size: 3rem;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  p {
    margin-top: 1rem;
    color: #718096;
    font-size: 1rem;
  }
`;


interface OrderItemDTO { id: number; productId: number; productName: string; price: number; quantity: number; }
interface OrderDTO {
  id: number;
  orderedAt: string;
  totalAmount: number;
  items: OrderItemDTO[];
  status?: string;
}

const statuses = [
  'PAYMENT_RECEIVED',
  'PROCESSING',
  'PREPARING',
  'READY_FOR_DELIVERY',
  'IN_DELIVERY',
  'DELIVERED',
  'CANCELED',
] as const;

const label = (s: string) => s.replaceAll('_', ' ').toLowerCase().replace(/^./, c => c.toUpperCase());

const AdminOrdersPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [pending, setPending] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<OrderDTO[]>('/api/orders');
      setOrders(data);
    } catch (e) {
      let message = 'Failed to load orders';
      if (axios.isAxiosError(e)) {
        type ErrorPayload = { message?: string };
        const payload = e.response?.data as ErrorPayload | undefined;
        message = e.response?.status === 401 || e.response?.status === 403 ? 'Not authorized' : (payload?.message || message);
      }
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (!user) { return; }
    if (!user.isAdmin) { navigate('/'); return; }

    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, navigate]);

  const onUpdate = async (orderId: number, status: string) => {
    try {
      setPending(orderId);
      const { data } = await axios.patch<OrderDTO>(`/api/orders/${orderId}/status`, null, { params: { status } });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.status } : o));
      toast('✅ Status updated successfully', 'success');
    } catch (e: unknown) {
      let message = 'Failed to update';
      if (axios.isAxiosError(e)) {
        type ErrorPayload = { message?: string };
        const data = e.response?.data as ErrorPayload | undefined;
        if (data?.message) message = data.message;
      }
      toast('❌ ' + message, 'error');
    } finally {
      setPending(null);
    }
  };

  const options = useMemo(() => statuses.map(s => ({ value: s, label: label(s) })), []);

  const filteredOrders = useMemo(() => {
    if (filterStatus === 'all') return orders;
    return orders.filter(o => o.status === filterStatus);
  }, [orders, filterStatus]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'PROCESSING' || o.status === 'PREPARING').length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { total, pending, delivered, revenue };
  }, [orders]);

  if (token && !user) {
    return (
      <Wrapper>
        <Container>
          <LoadingState>
            <div className="spinner">⏳</div>
            <p>Checking access...</p>
          </LoadingState>
        </Container>
      </Wrapper>
    );
  }

  if (loading) {
    return (
      <Wrapper>
        <Container>
          <LoadingState>
            <div className="spinner">⏳</div>
            <p>Loading orders...</p>
          </LoadingState>
        </Container>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Container>
        <Header>
          <h1>👨‍💼 Admin Dashboard</h1>
          <p>Manage and track all customer orders</p>
        </Header>

        <StatsGrid>
          <StatCard $color="#667eea">
            <div className="stat-icon">📦</div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-change">All time</div>
          </StatCard>

          <StatCard $color="#f6ad55">
            <div className="stat-icon">⏳</div>
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-change">In progress</div>
          </StatCard>

          <StatCard $color="#48bb78">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Delivered</div>
            <div className="stat-value">{stats.delivered}</div>
            <div className="stat-change">Completed</div>
          </StatCard>

          <StatCard $color="#764ba2">
            <div className="stat-icon">💰</div>
            <div className="stat-label">Revenue</div>
            <div className="stat-value">¥{stats.revenue.toLocaleString()}</div>
            <div className="stat-change">Total sales</div>
          </StatCard>
        </StatsGrid>

        <ControlBar>
          <FilterGroup>
            <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Orders ({orders.length})</option>
              {statuses.map(s => (
                <option key={s} value={s}>
                  {label(s)} ({orders.filter(o => o.status === s).length})
                </option>
              ))}
            </Select>
          </FilterGroup>
          
          <RefreshButton onClick={fetchOrders}>
            🔄 Refresh Orders
          </RefreshButton>
        </ControlBar>

        {filteredOrders.length === 0 ? (
          <EmptyState>
            <div className="emoji">📭</div>
            <h3>No orders found</h3>
            <p>{filterStatus === 'all' ? 'No orders have been placed yet' : `No orders with status "${label(filterStatus)}"`}</p>
          </EmptyState>
        ) : (
          <OrdersGrid>
            {filteredOrders.map(order => (
              <OrderCard key={order.id}>
                <OrderHeader>
                  <OrderInfo>
                    <div className="order-id">Order #{order.id}</div>
                    <div className="order-date">
                      📅 {new Date(order.orderedAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="order-total">💰 ¥{order.totalAmount.toLocaleString()}</div>
                  </OrderInfo>
                  
                  <StatusBadge $status={order.status || 'PAYMENT_RECEIVED'}>
                    {label(order.status || 'PAYMENT_RECEIVED')}
                  </StatusBadge>
                </OrderHeader>

                <ItemsList>
                  {order.items.map(item => (
                    <ItemRow key={item.id}>
                      <div>
                        <div className="item-name">{item.productName}</div>
                        <div className="item-details">
                          Quantity: {item.quantity} × ¥{item.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="item-name">
                        ¥{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </ItemRow>
                  ))}
                </ItemsList>

                <OrderActions>
                  <StatusSelect 
                    value={order.status ?? 'PAYMENT_RECEIVED'} 
                    onChange={(e) => onUpdate(order.id, e.target.value)} 
                    disabled={pending === order.id}
                  >
                    {options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </StatusSelect>
                </OrderActions>
              </OrderCard>
            ))}
          </OrdersGrid>
        )}
      </Container>
    </Wrapper>
  );
};

export default AdminOrdersPage;
