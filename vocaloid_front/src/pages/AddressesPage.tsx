import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";

/* 🟩 WRAPPER — page container */
const Wrapper = styled.div`
  padding: 1.25rem;
  max-width: 600px;
  margin: 1.25rem auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  animation: fadeInUp 0.4s ease;
  min-height: 70vh;

  h1 {
    text-align: center;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 1rem;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

/* 🟨 FORM — single-column layout */
const Form = styled.form`
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #fafafa;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-size: 0.95rem;
    transition: 0.2s;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.accent};
      box-shadow: 0 0 5px ${({ theme }) => theme.colors.accent}66;
    }
  }

  label {
    font-size: 0.9rem;
    color: #555;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  button {
    margin-top: 0.25rem;
    align-self: flex-start;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    cursor: pointer;
    transition: background 0.2s ease, box-shadow 0.2s ease;
    font-weight: 600;

    &:hover {
      background: ${({ theme }) => theme.colors.accent};
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
  }
`;

/* 🟥 ROW — address card style */
const Row = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 0.85rem 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
  transition: box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);

  &:hover {
    box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  }

  div:first-child {
    flex: 1 1 300px;
  }

  span.default {
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.9rem;
    margin-left: 4px;
  }

  div:last-child {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  button {
    background: ${({ theme }) => theme.colors.primary};
    border: none;
    color: white;
    border-radius: 8px;
    padding: 0.45rem 0.85rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background 0.2s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.accent};
    }

    & + button {
      background: #ccc;

      &:hover {
        background: #bbb;
      }
    }
  }
`;

/* 🧱 Component Logic — unchanged */
interface AddressDTO {
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

const AddressesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<AddressDTO[]>([]);
  const [form, setForm] = useState<Partial<AddressDTO>>({ country: "KR" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    axios.get<AddressDTO[]>(`/api/addresses/${user.id}`).then(res => setItems(res.data));
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const payload = {
      recipientName: form.recipientName,
      line1: form.line1,
      line2: form.line2,
      city: form.city,
      state: form.state,
      postalCode: form.postalCode,
      country: form.country,
      phone: form.phone,
      isDefault: !!form.isDefault,
    };
    const { data } = await axios.post<AddressDTO>(`/api/addresses/${user.id}`, payload);
    setItems(prev => [data, ...prev]);
    setForm({ country: "KR" });
    toast("Address added", "success");
  };

  const remove = async (id: number) => {
    if (!user) return;
    await axios.delete(`/api/addresses/${user.id}/${id}`);
    setItems(prev => prev.filter(a => a.id !== id));
    toast("Address removed", "success");
  };

  const makeDefault = async (id: number) => {
    if (!user) return;
    await axios.put(`/api/addresses/${user.id}/${id}`, { isDefault: true });
    setItems(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    toast("Default address updated", "success");
  };

  if (!user) return null;

  return (
    <Wrapper>
      <h1>Addresses</h1>

      {/* 🟨 Single-column form */}
      <Form onSubmit={submit}>
        <input placeholder="Recipient" value={form.recipientName || ""} onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))} required />
        <input placeholder="Phone" value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
        <input placeholder="Line 1" value={form.line1 || ""} onChange={e => setForm(f => ({ ...f, line1: e.target.value }))} required />
        <input placeholder="Line 2" value={form.line2 || ""} onChange={e => setForm(f => ({ ...f, line2: e.target.value }))} />
        <input placeholder="City" value={form.city || ""} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required />
        <input placeholder="State" value={form.state || ""} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
        <input placeholder="Postal Code" value={form.postalCode || ""} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} required />
        <input placeholder="Country" value={form.country || ""} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
        <label>
          <input type="checkbox" checked={!!form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} /> Default
        </label>
        <button type="submit">Add Address</button>
      </Form>

      {/* 🟥 Address list */}
      {items.length === 0 ? (
        <p>No addresses yet.</p>
      ) : (
        items.map(a => (
          <Row key={a.id}>
            <div>
              <div style={{ fontWeight: 600 }}>
                {a.recipientName}
                {a.isDefault && <span className="default">(default)</span>}
              </div>
              <div>{a.line1}{a.line2 ? ", " + a.line2 : ""}, {a.city} {a.postalCode}, {a.country}</div>
              <div>{a.phone}</div>
            </div>
            <div>
              {!a.isDefault && <button onClick={() => makeDefault(a.id)}>Make default</button>}
              <button onClick={() => remove(a.id)}>Delete</button>
            </div>
          </Row>
        ))
      )}
    </Wrapper>
  );
};

export default AddressesPage;
