import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { PageTransition } from "../components/PageTransition";

const Wrapper = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem 3rem;
  animation: fadeInUp 0.5s ease;

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Breadcrumb = styled.nav`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: #718096;

  a {
    color: #667eea;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #764ba2;
      text-decoration: underline;
    }
  }

  span {
    color: #cbd5e0;
  }
`;

const ProductLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 1.5rem;
  }
`;

const ImageSection = styled.div`
  position: relative;
`;

const ProductImage = styled.div<{ $imageUrl?: string }>`
  width: 100%;
  aspect-ratio: 1;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  position: relative;
  overflow: hidden;
  cursor: zoom-in;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }

  @media (max-width: 968px) {
    font-size: 6rem;
  }
`;

const WishlistBadge = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 10;

  &:hover {
    transform: scale(1.1);
    background: #fff;
  }

  &:active {
    transform: scale(0.95);
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Category = styled.span`
  display: inline-block;
  padding: 0.4rem 1rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  width: fit-content;
`;

const ProductTitle = styled.h1`
  font-size: 2.5rem;
  color: #2d3748;
  margin: 0;
  line-height: 1.2;

  @media (max-width: 968px) {
    font-size: 2rem;
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 1.5rem 0;
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
`;

const Price = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;

  @media (max-width: 968px) {
    font-size: 2rem;
  }
`;

const OldPrice = styled.div`
  font-size: 1.5rem;
  color: #a0aec0;
  text-decoration: line-through;
`;

const Description = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a5568;

  p {
    margin-bottom: 1rem;
  }
`;

const StockIndicator = styled.div<{ $inStock: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: ${props => props.$inStock ? '#48bb78' : '#f56565'};

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${props => props.$inStock ? '#48bb78' : '#f56565'};
  }
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

const QuantityLabel = styled.label`
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: white;
`;

const QuantityButton = styled.button`
  width: 45px;
  height: 45px;
  border: none;
  background: #f7fafc;
  cursor: pointer;
  font-size: 1.3rem;
  font-weight: bold;
  color: #667eea;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`;

const QuantityDisplay = styled.div`
  width: 60px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const AddToCartButton = styled.button`
  flex: 2;
  padding: 1.2rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const BuyNowButton = styled.button`
  flex: 1;
  padding: 1.2rem 2rem;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #4a5568;

  span:first-child {
    font-size: 1.5rem;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: 3rem;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);

  h2 {
    color: #f56565;
    margin-bottom: 1rem;
  }

  p {
    color: #718096;
    margin-bottom: 1.5rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;

    &:hover {
      background: #764ba2;
    }
  }
`;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  stockQuantity?: number;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!user) {
      toast("Please log in to add items to cart", "info");
      navigate("/login");
      return;
    }
    try {
      await addToCart(product.id, quantity);
      toast(`✅ Added ${quantity} item(s) to cart!`, "success");
      setQuantity(1);
    } catch (error) {
      toast("Failed to add to cart", "error");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!user) {
      toast("Please log in to continue", "info");
      navigate("/login");
      return;
    }
    try {
      await addToCart(product.id, quantity);
      navigate("/cart");
    } catch (error) {
      toast("Failed to proceed", "error");
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
    if (!user) {
      toast("Please log in to use wishlist", "info");
      navigate("/login");
      return;
    }
    try {
      await axios.post(`/api/wishlist/${user.id}/${product.id}`);
      toast("Added to wishlist! ❤️", "success");
    } catch (error) {
      toast("Already in wishlist", "info");
    }
  };

  const increaseQuantity = () => {
    if (product?.stockQuantity && quantity < product.stockQuantity) {
      setQuantity(q => q + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <Wrapper>
          <LoadingSpinner>⏳</LoadingSpinner>
        </Wrapper>
      </PageTransition>
    );
  }

  if (error || !product) {
    return (
      <PageTransition>
        <Wrapper>
          <ErrorMessage>
            <h2>😞 Product Not Found</h2>
            <p>The product you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => navigate("/")}>Back to Home</button>
          </ErrorMessage>
        </Wrapper>
      </PageTransition>
    );
  }

  const inStock = (product.stockQuantity ?? 0) > 0;
  const maxQuantity = product.stockQuantity ?? 0;

  return (
    <PageTransition>
      <Wrapper>
        <Breadcrumb>
          <Link to="/">Home</Link>
          <span>/</span>
          {product.categoryName && (
            <>
              <span>{product.categoryName}</span>
              <span>/</span>
            </>
          )}
          <span>{product.name}</span>
        </Breadcrumb>

        <ProductLayout>
          <ImageSection>
            <ProductImage $imageUrl={product.imageUrl}>
              {!product.imageUrl && '🎵'}
              <WishlistBadge 
                onClick={handleAddToWishlist}
                title="Add to wishlist"
              >
                ❤️
              </WishlistBadge>
            </ProductImage>
          </ImageSection>

          <InfoSection>
            {product.categoryName && <Category>{product.categoryName}</Category>}
            
            <ProductTitle>{product.name}</ProductTitle>

            <StockIndicator $inStock={inStock}>
              {inStock ? `In Stock (${maxQuantity} available)` : 'Out of Stock'}
            </StockIndicator>

            <PriceSection>
              <Price>¥{product.price.toLocaleString()}</Price>
              {/* Optional: Show old price if on sale */}
              {/* <OldPrice>¥{(product.price * 1.2).toLocaleString()}</OldPrice> */}
            </PriceSection>

            <Description>
              <p>{product.description || 'No description available.'}</p>
            </Description>

            <QuantitySelector>
              <QuantityLabel>Quantity:</QuantityLabel>
              <QuantityControl>
                <QuantityButton 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  −
                </QuantityButton>
                <QuantityDisplay>{quantity}</QuantityDisplay>
                <QuantityButton 
                  onClick={increaseQuantity}
                  disabled={quantity >= maxQuantity}
                >
                  +
                </QuantityButton>
              </QuantityControl>
            </QuantitySelector>

            <ActionButtons>
              <AddToCartButton 
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                🛒 Add to Cart
              </AddToCartButton>
              <BuyNowButton 
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                ⚡ Buy Now
              </BuyNowButton>
            </ActionButtons>

            <Features>
              <Feature>
                <span>🚚</span>
                <span>Free shipping on orders over ¥5,000</span>
              </Feature>
              <Feature>
                <span>↩️</span>
                <span>30-day return policy</span>
              </Feature>
              <Feature>
                <span>✅</span>
                <span>100% authentic products</span>
              </Feature>
              <Feature>
                <span>🔒</span>
                <span>Secure payment</span>
              </Feature>
            </Features>
          </InfoSection>
        </ProductLayout>
      </Wrapper>
    </PageTransition>
  );
};

export default ProductDetail;