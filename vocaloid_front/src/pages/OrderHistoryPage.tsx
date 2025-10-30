import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 3rem auto;
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
          <div key={o.id} style={{ borderBottom: "1px solid #eee", padding: "1rem 0" }}>
            <div>Order #{o.id} • {new Date(o.orderedAt).toLocaleString()}</div>
            <div>Total: ¥{o.totalAmount}</div>
            <ul>
              {o.items.map(it => (
                <li key={it.id}>{it.productName} × {it.quantity} — ¥{it.price}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </Wrapper>
  );
};

export default OrderHistoryPage;
