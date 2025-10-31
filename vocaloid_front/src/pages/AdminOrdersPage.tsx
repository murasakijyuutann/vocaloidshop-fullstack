import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToast';

const Wrapper = styled.div`
  padding: 2rem;
  max-width: 1100px;
  margin: 2rem auto;
  background: ${({ theme }) => theme.colors.bg};
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  th, td {
    padding: 0.6rem 0.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: top;
  }

  th { text-align: left; }
`;

const StatusSelect = styled.select`
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

// No separate update button needed; we update on select change.

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

  const fetchOrders = async () => {
    try {
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
    }
  };

  useEffect(() => {
    // If no token at all, go to login
    if (!token) { navigate('/login'); return; }

    // Wait for user to be resolved by /auth/me on initial load
    if (!user) { return; }

    // Once we have a user, gate by role
    if (!user.isAdmin) { navigate('/'); return; }

    fetchOrders();
  // fetchOrders is intentionally not added to deps to avoid ref churn
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user, navigate]);

  const onUpdate = async (orderId: number, status: string) => {
    try {
      setPending(orderId);
      const { data } = await axios.patch<OrderDTO>(`/api/orders/${orderId}/status`, null, { params: { status } });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: data.status } : o));
      toast('Status updated', 'success');
    } catch (e: unknown) {
      let message = 'Failed to update';
      if (axios.isAxiosError(e)) {
        type ErrorPayload = { message?: string };
        const data = e.response?.data as ErrorPayload | undefined;
        if (data?.message) message = data.message;
      }
      toast(message, 'error');
    } finally {
      setPending(null);
    }
  };

  const options = useMemo(() => statuses.map(s => ({ value: s, label: label(s) })), []);

  // While token exists but user is not yet loaded, avoid redirect flicker
  if (token && !user) {
    return (
      <Wrapper>
        <h1>Admin • Orders</h1>
        <Card>Checking access…</Card>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <h1>Admin • Orders</h1>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div>Total orders: {orders.length}</div>
          <button onClick={fetchOrders} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}>Refresh</button>
        </div>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Placed</th>
              <th>Total</th>
              <th>Status</th>
              <th>Items</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{new Date(o.orderedAt).toLocaleString()}</td>
                <td>¥{o.totalAmount}</td>
                <td>{o.status ? label(o.status) : '-'}</td>
                <td>
                  <ul style={{margin:0, paddingInlineStart: '1rem'}}>
                    {o.items.map(i => (
                      <li key={i.id}>{i.productName} × {i.quantity}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <StatusSelect value={o.status ?? 'PAYMENT_RECEIVED'} onChange={(e) => onUpdate(o.id, e.target.value)} disabled={pending === o.id}>
                    {options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </StatusSelect>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Wrapper>
  );
};

export default AdminOrdersPage;
