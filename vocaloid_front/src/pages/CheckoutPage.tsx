import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";

const Wrapper = styled.div`
  padding: 2rem;
  max-width: 700px;
  margin: 3rem auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
  animation: fadeInUp 0.5s ease;

  h1 {
    color: ${({ theme }) => theme.colors.primary};
    text-align: center;
    margin-bottom: 1.5rem;
  }

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 10px;
    padding: 0.8rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1rem;
    transition: 0.3s;

    &:hover {
      background: ${({ theme }) => theme.colors.accent};
      transform: scale(1.05);
    }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Line = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;

  &:hover {
    background: #f9f9fb;
    border-radius: 8px;
  }
`;


const CheckoutPage: React.FC = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [addresses, setAddresses] = useState<Array<{id:number;recipientName:string;line1:string;line2?:string;city:string;postalCode:string;country:string;phone:string;isDefault:boolean;}>>([]);
  const [addressId, setAddressId] = useState<number | "">("");
  const toast = useToast();

  const total = useMemo(() => cart.reduce((s, i) => s + i.totalPrice, 0), [cart]);

  const placeOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setPlacing(true);
    try {
      const qs = addressId ? `?addressId=${addressId}` : "";
      await axios.post(`/api/orders/place/${user.id}${qs}`);
      await fetchCart();
      toast("✅ Order placed!", "success");
      navigate("/orders");
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

  // Load user's saved addresses for selection
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user) return;
      try {
        const { data } = await axios.get<Array<{id:number;recipientName:string;line1:string;line2?:string;city:string;postalCode:string;country:string;phone:string;isDefault:boolean;}>>(`/api/addresses/${user.id}`);
        setAddresses(data);
        // Preselect default address if present
        const def = data.find(a => a.isDefault);
        if (def) setAddressId(def.id);
      } catch (e: unknown) {
        // If unauthorized, redirect to login to refresh auth
        type AxiosErrorLike = { response?: { status?: number } };
        const ax = (e as AxiosErrorLike);
        if (typeof e === "object" && e !== null && ax.response?.status === 401) {
          navigate("/login");
          return;
        }
        // Keep checkout usable without saved addresses
      }
    };
    loadAddresses();
  }, [user, navigate]);

  if (cart.length === 0) {
    return <Wrapper>Your cart is empty.</Wrapper>;
  }

  return (
    <Wrapper>
      <h1>Checkout</h1>
      {user && (
        <div style={{ margin: "0 0 1rem" }}>
          <label>
            Shipping address:
            <select
              value={addressId}
              onChange={(e) => setAddressId(e.target.value ? Number(e.target.value) : "")}
              style={{ marginLeft: 8 }}
            >
              <option value="">Select at delivery</option>
              {addresses.map(a => (
                <option key={a.id} value={a.id}>
                  {a.recipientName} — {a.line1}{a.line2 ? ", " + a.line2 : ""}, {a.city}
                </option>
              ))}
            </select>
            <button style={{ marginLeft: 8 }} onClick={() => navigate("/addresses")}>Manage</button>
          </label>
        </div>
      )}
      {cart.map(item => (
        <Line key={item.cartItemId}>
          <div>
            {item.productName}
            <div style={{ fontSize: "0.9rem", color: "#666" }}>
              ¥{item.price} × {item.quantity}
            </div>
          </div>
          <div>¥{item.totalPrice}</div>
        </Line>
      ))}
      <h2>Total: ¥{total}</h2>
      <button onClick={placeOrder} disabled={placing}>Place Order</button>
    </Wrapper>
  );
};

export default CheckoutPage;
