import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { PageTransition } from "../components/PageTransition";

const Wrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: calc(100vh - 200px);
  animation: fadeInUp 0.5s ease;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #718096;
  }

  @media (max-width: 768px) {
    margin-bottom: 2rem;

    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e2e8f0;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  grid-column: ${props => props.$fullWidth ? '1 / -1' : 'auto'};
`;

const Label = styled.label`
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f7fafc;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #2d3748;
  cursor: pointer;
  padding: 0.5rem 0;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #667eea;
  }
`;

const SubmitButton = styled.button`
  grid-column: 1 / -1;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  margin-top: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

const AddressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AddressCard = styled.div<{ $isDefault?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border: 2px solid ${props => props.$isDefault ? '#667eea' : 'transparent'};
  position: relative;

  &:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.12);
    transform: translateY(-4px);
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const DefaultBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const AddressInfo = styled.div`
  margin-bottom: 1rem;
`;

const RecipientName = styled.div`
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const AddressLine = styled.div`
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.6;
`;

const PhoneNumber = styled.div`
  color: #718096;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  flex: 1;
  padding: 0.75rem 1rem;
  background: ${props => {
    if (props.$variant === 'danger') return 'transparent';
    return 'transparent';
  }};
  color: ${props => {
    if (props.$variant === 'danger') return '#f56565';
    return '#667eea';
  }};
  border: 2px solid ${props => {
    if (props.$variant === 'danger') return '#fed7d7';
    return '#667eea';
  }};
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => {
      if (props.$variant === 'danger') return '#fff5f5';
      return '#667eea15';
    }};
    border-color: ${props => {
      if (props.$variant === 'danger') return '#f56565';
      return '#667eea';
    }};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { 
      navigate("/login"); 
      return; 
    }
    
    const fetchAddresses = async () => {
      try {
        const res = await axios.get<AddressDTO[]>(`/api/addresses/${user.id}`);
        setItems(res.data);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
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
      toast("✅ Address added successfully!", "success");
    } catch {
      toast("❌ Failed to add address", "error");
    }
  };

  const remove = async (id: number) => {
    if (!user) return;
    try {
      await axios.delete(`/api/addresses/${user.id}/${id}`);
      setItems(prev => prev.filter(a => a.id !== id));
      toast("🗑️ Address removed", "success");
    } catch {
      toast("❌ Failed to remove address", "error");
    }
  };

  const makeDefault = async (id: number) => {
    if (!user) return;
    try {
      await axios.put(`/api/addresses/${user.id}/${id}`, { isDefault: true });
      setItems(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
      toast("✅ Default address updated", "success");
    } catch {
      toast("❌ Failed to update default address", "error");
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <PageTransition>
        <Wrapper>
          <Header>
            <h1>📍 Delivery Addresses</h1>
            <p>Loading your addresses...</p>
          </Header>
        </Wrapper>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Wrapper>
        <Header>
          <h1>� Delivery Addresses</h1>
          <p>Manage your shipping addresses</p>
        </Header>

        <FormCard>
          <FormTitle>Add New Address</FormTitle>
          <Form onSubmit={submit}>
            <FormGroup>
              <Label htmlFor="recipient">Recipient Name *</Label>
              <Input
                id="recipient"
                placeholder="Full name"
                value={form.recipientName || ""}
                onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+82-10-1234-5678"
                value={form.phone || ""}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup $fullWidth>
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input
                id="line1"
                placeholder="Street address, P.O. box"
                value={form.line1 || ""}
                onChange={e => setForm(f => ({ ...f, line1: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup $fullWidth>
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                placeholder="Apartment, suite, unit, building, floor"
                value={form.line2 || ""}
                onChange={e => setForm(f => ({ ...f, line2: e.target.value }))}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Seoul"
                value={form.city || ""}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="state">State / Province</Label>
              <Input
                id="state"
                placeholder="Gangnam-gu"
                value={form.state || ""}
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="postal">Postal Code *</Label>
              <Input
                id="postal"
                placeholder="06000"
                value={form.postalCode || ""}
                onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                placeholder="KR"
                value={form.country || ""}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                required
              />
            </FormGroup>

            <FormGroup $fullWidth>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={!!form.isDefault}
                  onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                />
                Set as default address
              </CheckboxLabel>
            </FormGroup>

            <SubmitButton type="submit">➕ Add Address</SubmitButton>
          </Form>
        </FormCard>

        {items.length === 0 ? (
          <EmptyState>
            <div className="emoji">📭</div>
            <h3>No addresses saved</h3>
            <p>Add your first delivery address above</p>
          </EmptyState>
        ) : (
          <AddressGrid>
            {items.map(address => (
              <AddressCard key={address.id} $isDefault={address.isDefault}>
                {address.isDefault && <DefaultBadge>✓ Default</DefaultBadge>}
                
                <AddressInfo>
                  <RecipientName>{address.recipientName}</RecipientName>
                  <AddressLine>
                    {address.line1}
                    {address.line2 && `, ${address.line2}`}
                  </AddressLine>
                  <AddressLine>
                    {address.city}{address.state && `, ${address.state}`} {address.postalCode}
                  </AddressLine>
                  <AddressLine>{address.country}</AddressLine>
                  <PhoneNumber>📞 {address.phone}</PhoneNumber>
                </AddressInfo>

                <ActionButtons>
                  {!address.isDefault && (
                    <ActionButton onClick={() => makeDefault(address.id)}>
                      Set as Default
                    </ActionButton>
                  )}
                  <ActionButton
                    $variant="danger"
                    onClick={() => remove(address.id)}
                  >
                    Delete
                  </ActionButton>
                </ActionButtons>
              </AddressCard>
            ))}
          </AddressGrid>
        )}
      </Wrapper>
    </PageTransition>
  );
};

export default AddressesPage;
