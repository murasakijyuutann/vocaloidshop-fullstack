import React, { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../hooks/useToast";
import { useCart } from "../hooks/useCart";
import { PageTransition } from "../components/PageTransition";

const Wrapper = styled.div`
  max-width: 1400px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-4px);
    }
  }
`;

const ProductImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  height: 240px;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  position: relative;

  @media (max-width: 768px) {
    height: 180px;
    font-size: 3rem;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  color: #f56565;

  &:hover {
    transform: scale(1.1);
    background: #fff5f5;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ProductInfo = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ProductName = styled(Link)`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  text-decoration: none;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;

  &:hover {
    color: #667eea;
  }

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ProductPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  grid-column: 1 / -1;

  .emoji {
    font-size: 5rem;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.8rem;
    color: #2d3748;
    margin-bottom: 0.5rem;
  }

  p {
    color: #718096;
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

const ContinueButton = styled(Link)`
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }

  &:active {
    transform: translateY(0);
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
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<WishlistItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const fetchWishlist = async () => {
      try {
        const res = await axios.get<WishlistItemDTO[]>(`/api/wishlist/${user.id}`);
        setItems(res.data);
      } catch (error) {
        toast("Failed to load wishlist", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, navigate, toast]);

  const remove = async (productId: number) => {
    if (!user) return;
    try {
      await axios.delete(`/api/wishlist/${user.id}/${productId}`);
      setItems(prev => prev.filter(i => i.productId !== productId));
      toast("❤️ Removed from wishlist", "success");
    } catch (error) {
      toast("Failed to remove item", "error");
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      toast("✅ Added to cart!", "success");
    } catch (error) {
      toast("Failed to add to cart", "error");
    } finally {
      setAddingToCart(null);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <PageTransition>
        <Wrapper>
          <Header>
            <h1>❤️ Your Wishlist</h1>
            <p>Loading your favorite items...</p>
          </Header>
        </Wrapper>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Wrapper>
        <Header>
          <h1>❤️ Your Wishlist</h1>
          <p>{items.length} {items.length === 1 ? 'item' : 'items'} saved for later</p>
        </Header>

        {items.length === 0 ? (
          <EmptyState>
            <div className="emoji">💔</div>
            <h2>Your wishlist is empty</h2>
            <p>Save your favorite items to buy them later</p>
            <ContinueButton to="/">Start Shopping</ContinueButton>
          </EmptyState>
        ) : (
          <Grid>
            {items.map(item => (
              <ProductCard key={item.id}>
                <ProductImage $imageUrl={item.imageUrl}>
                  {!item.imageUrl && '🎵'}
                  <RemoveButton
                    onClick={() => remove(item.productId)}
                    aria-label="Remove from wishlist"
                    title="Remove from wishlist"
                  >
                    ✕
                  </RemoveButton>
                </ProductImage>
                
                <ProductInfo>
                  <ProductName to={`/product/${item.productId}`}>
                    {item.productName}
                  </ProductName>
                  <ProductPrice>¥{item.price.toLocaleString()}</ProductPrice>
                  <AddToCartButton
                    onClick={() => handleAddToCart(item.productId)}
                    disabled={addingToCart === item.productId}
                  >
                    {addingToCart === item.productId ? "Adding..." : "🛒 Add to Cart"}
                  </AddToCartButton>
                </ProductInfo>
              </ProductCard>
            ))}
          </Grid>
        )}
      </Wrapper>
    </PageTransition>
  );
};

export default WishlistPage;
