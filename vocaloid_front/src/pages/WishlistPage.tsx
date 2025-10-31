import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";

const Wrapper = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: auto;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.75rem 0;
`;

const ItemLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  display: block;

  &:hover {
    text-decoration: underline;
  }
`;

interface WishlistItemDTO {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
}

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<WishlistItemDTO[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    axios.get<WishlistItemDTO[]>(`/api/wishlist/${user.id}`).then(res => setItems(res.data));
  }, [user, navigate]);

  const remove = async (productId: number) => {
    if (!user) return;
    await axios.delete(`/api/wishlist/${user.id}/${productId}`);
    setItems(prev => prev.filter(i => i.productId !== productId));
    toast("Removed from wishlist", "success");
  };

  if (!user) return null;

  return (
    <Wrapper>
      <h1>Your Wishlist</h1>
      {items.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        items.map(i => (
          <Row key={i.id}>
            <ItemLink to={`/product/${i.productId}`} aria-label={`View ${i.productName}`}>
              <div style={{ fontWeight: 600 }}>{i.productName}</div>
              <div>¥{i.price}</div>
            </ItemLink>
            <div>
              <button onClick={() => remove(i.productId)}>Remove</button>
            </div>
          </Row>
        ))
      )}
    </Wrapper>
  );
};

export default WishlistPage;
