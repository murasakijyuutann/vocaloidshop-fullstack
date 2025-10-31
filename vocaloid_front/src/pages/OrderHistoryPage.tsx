import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 2rem auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  animation: fadeInUp 0.5s ease;

  h1 {
    color: ${({ theme }) => theme.colors.primary};
    text-align: center;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Row = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem 0;
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary}22;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  font-size: 0.85rem;
`;

const Progress = styled.ol`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  padding: 0;
  margin: 0.5rem 0 0;
`;

const Step = styled.li<{ active: boolean }>`
  text-align: center;
  font-size: 0.75rem;
  padding: 0.4rem 0.3rem;
  border-radius: 8px;
  background: ${({ active, theme }) => (active ? theme.colors.primary : theme.colors.border)};
  color: ${({ active }) => (active ? '#fff' : '#666')};
  white-space: nowrap;
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
}

const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      const { data } = await axios.get<OrderDTO[]>(`/api/orders/user/${user.id}`);
      setOrders(data);
    };
    run();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <Wrapper>
      <h1>📦 Order History</h1>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        orders.map(o => (
          <Row key={o.id}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <div>Order #{o.id} • {new Date(o.orderedAt).toLocaleString()}</div>
              {o.status && <StatusBadge>{readableStatus(o.status)}</StatusBadge>}
            </div>
            {o.status && (
              <Progress>
                {steps.map((s, idx) => (
                  <Step key={s} active={idx <= statusIndex(o.status!)}>{s}</Step>
                ))}
              </Progress>
            )}
            <div style={{marginTop:8}}>Total: ¥{o.totalAmount}</div>
            <ul>
              {o.items.map(it => (
                <li key={it.id}>{it.productName} × {it.quantity} — ¥{it.price}</li>
              ))}
            </ul>
          </Row>
        ))
      )}
    </Wrapper>
  );
};

export default OrderHistoryPage;

// Helpers
const steps = [
  'Payment received',
  'Processing',
  'Preparing',
  'Ready for delivery',
  'In delivery',
  'Delivered'
];

function statusIndex(code: string) {
  switch (code) {
    case 'PAYMENT_RECEIVED': return 0;
    case 'PROCESSING': return 1;
    case 'PREPARING': return 2;
    case 'READY_FOR_DELIVERY': return 3;
    case 'IN_DELIVERY': return 4;
    case 'DELIVERED': return 5;
    case 'CANCELED': return -1;
    default: return -1;
  }
}

function readableStatus(code: string) {
  switch (code) {
    case 'PAYMENT_RECEIVED': return 'Payment received';
    case 'PROCESSING': return 'Processing';
    case 'PREPARING': return 'Preparing';
    case 'READY_FOR_DELIVERY': return 'Ready for delivery';
    case 'IN_DELIVERY': return 'In delivery';
    case 'DELIVERED': return 'Delivered';
    case 'CANCELED': return 'Canceled';
    default: return code;
  }
}
